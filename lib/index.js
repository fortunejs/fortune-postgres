import pg from 'pg'
import { primaryKeyTypes, postgresTypeMap, inputValue, getCode,
  inputRecord, outputRecord } from './helpers'


/**
 * PostgreSQL adapter.
 */
export default Adapter => class PostgreSQLAdapter extends Adapter {

  /**
   * Table setup happens at this stage. The default policy is completely
   * non-destructive, so tables and columns may only be added but not modified
   * in any way. Migrations are outside of the scope of this adapter.
   */
  connect () {
    const { recordTypes, options, keys: {
      primary: primaryKey, type: typeKey, link: linkKey, isArray: isArrayKey
    } } = this
    const types = Object.keys(recordTypes)

    if (!('url' in options))
      throw new Error(`A connection URL is required.`)

    let primaryKeyType = options.primaryKeyType || String

    if (!primaryKeyTypes.has(primaryKeyType))
      throw new Error(`The primary key type must be a string or a number.`)

    if (!('isNative' in options)) options.isNative = false
    if (!('typeMap' in options)) options.typeMap = {}

    const { isNative, typeMap, url } = options

    return new Promise((resolve, reject) =>
      (isNative ? pg.native : pg)
      .connect(url, (error, client, done) => {
        if (error) return reject(error)

        this.client = client
        this.done = done

        return resolve()
      }))

    .then(() => new Promise((resolve, reject) =>
      this.client.query('set client_min_messages = error',
        error => error ? reject(error) : resolve())))

    // Make sure that tables exist.
    .then(() => Promise.all(types.map(type =>
    new Promise((resolve, reject) => {
      const mappedType = type in typeMap ? typeMap[type] : type
      const createTable = `create table if not exists "${mappedType}" ` +
        `("${primaryKey}" ${postgresTypeMap.get(primaryKeyType)} ` +
        `primary key)`

      this.client.query(createTable, error =>
        error ? reject(error) : resolve())
    }))))

    // Get column definitions.
    .then(() => Promise.all(types.map(type =>
    new Promise((resolve, reject) => {
      const mappedType = type in typeMap ? typeMap[type] : type
      const getColumns = `select * from information_schema.columns ` +
        `where table_name = '${mappedType}'`

      this.client.query(getColumns, (error, result) =>
        error ? reject(error) : resolve(result))
    }))))

    // Add missing columns.
    .then(results => {
      const tableColumns = results.reduce((map, result, index) => {
        map[types[index]] = result.rows
        return map
      }, {})

      const addColumns = []
      const addColumn = (type, field) => new Promise((resolve, reject) => {
        const fieldDefinition = recordTypes[type][field]
        const isArray = fieldDefinition[isArrayKey]
        const dataType = postgresTypeMap.get(typeKey in fieldDefinition ?
          fieldDefinition[typeKey] : primaryKeyType)
        const link = fieldDefinition[linkKey]
        const isForeignKey = link && !isArray
        const mappedType = type in typeMap ? typeMap[type] : type
        const addColumn = `alter table "${mappedType}" add column ` +
          `"${field}" ${dataType}${isArray ? '[]' : ''}` +
          `${isForeignKey && options.useForeignKeys ?
          (' references "' +
          (link in typeMap ? typeMap[link] : link) +
          '" on delete set null') : ''}`

        this.client.query(addColumn, error =>
          error ? reject(error) : resolve())
      })

      for (let type in tableColumns)
        for (let field in recordTypes[type])
          if (!tableColumns[type].some(row => row.column_name === field))
            addColumns.push(addColumn(type, field))

      return Promise.all(addColumns)
    })

    .then(() => null)
  }


  disconnect () {
    const { options: { isNative } } = this
    delete this.client
    this.done()
    ; (isNative ? pg.native : pg).end()
    return Promise.resolve()
  }


  find (type, ids, options) {
    // Handle no-op.
    if (ids && !ids.length) return super.find()

    // Set options if falsy, the default argument won't work.
    if (!options) options = {}

    const { recordTypes, client, keys: {
      primary: primaryKey, isArray: isArrayKey
    }, options: { typeMap } } = this
    const fields = recordTypes[type]

    let columns = Object.keys(options.fields || {})
    columns = columns.length ?
      (columns.every(column => options.fields[column]) ?
      [ primaryKey, ...columns ] : [ primaryKey,
        ...Object.keys(fields).filter(field =>
          !columns.some(column => column === field)) ])
      .map(column => `"${column}"`).join(', ') : '*'

    const selectColumns = `select ${columns} from ` +
      `"${type in typeMap ? typeMap[type] : type}" `
    const sql = options.query || ''
    const parameters = []
    let index = 0
    let where = []
    let order = []
    let slice = ''

    const mapValue = value => {
      index++
      parameters.push(inputValue(value))
      return `$${index}`
    }

    if (ids) {
      where.push(`"${primaryKey}" in (` + ids.map(() => {
        index++
        return `$${index}`
      }).join(', ') + `)`)
      parameters.push(...ids)
    }

    for (let field in options.match) {
      const value = options.match[field]
      const isArray = fields[field][isArrayKey]

      if (!isArray) {
        if (Array.isArray(value))
          where.push(`"${field}" in (${value.map(mapValue).join(', ')})`)
        else {
          index++
          parameters.push(inputValue(value))
          where.push(`"${field}" = $${index}`)
        }
        continue
      }

      // Array containment.
      if (Array.isArray(value))
        where.push(`"${field}" @> {${value.map(mapValue).join(', ')}}`)
      else {
        index++
        parameters.push(inputValue(value))
        where.push(`"${field}" @> {$${index}}`)
      }
    }

    where = where.length ? `where ${where.join(' and ')}` : ''

    for (let field in options.sort) {
      order.push(`"${field}" ` + (options.sort[field] ? 'asc' : 'desc'))
    }

    order = order.length ? `order by ${order.join(', ')}` : ''

    if (options.limit) slice += `limit ${options.limit} `
    if (options.offset) slice += `offset ${options.offset} `

    const findRecords = `${selectColumns} ${sql} ${where} ${order} ${slice}`

    // Parallelize the find method with count method.
    return Promise.all([
      new Promise((resolve, reject) =>
        client.query(findRecords, parameters.length ? parameters : null,
          (error, result) => error ? reject(error) : resolve(result))),
      new Promise((resolve, reject) =>
        client.query(`select count(*) from ` +
          `"${type in typeMap ? typeMap[type] : type}" ` +
          `${sql} ${where}`,
          parameters.length ? parameters : null,
          (error, result) => error ? reject(error) : resolve(result)))
    ])

    .then(results => {
      const records = results[0].rows.map(outputRecord.bind(this, type))
      records.count = parseInt(results[1].rows[0].count, 10)
      return records
    })
  }


  create (type, records) {
    if (!records.length) return super.create()

    records = records.map(inputRecord.bind(this, type))

    const { recordTypes, keys: { primary: primaryKey }, client,
      errors: { ConflictError }, options: { typeMap } } = this

    // The sort order here doesn't really matter, as long as it's consistent.
    const orderedFields = Object.keys(recordTypes[type]).sort()

    const parameters = []
    let index = 0

    const createRecords = `insert into ` +
      `"${type in typeMap ? typeMap[type] : type}" (` + [
        `"${primaryKey}"`, ...orderedFields.map(field => `"${field}"`)
      ].join(', ') + `) values ` + records.map(record => {
        parameters.push(record[primaryKey],
          ...orderedFields.map(field => inputValue(record[field])))

        return `(${[ primaryKey, ...orderedFields ].map(() => {
          index++
          return `$${index}`
        }).join(', ')})`
      }).join(', ')

    return new Promise((resolve, reject) =>
      client.query(createRecords, parameters, error => {
        if (error) {
          const code = getCode(error)

          // Cryptic SQL error state that means unique constraint violated.
          // http://www.postgresql.org/docs/8.2/static/errcodes-appendix.html
          if (code === '23505')
            return reject(new ConflictError(`Unique constraint violated.`))

          return reject(error)
        }

        return resolve(records.map(outputRecord.bind(this, type)))
      }))
  }


  update (type, updates) {
    const { client, keys: { primary: primaryKey },
      options: { typeMap } } = this

    // This is a little bit wrong, it is only safe to update within a
    // transaction. It's not possible to put it all in one update statement,
    // since the updates may be sparse.
    return Promise.all(updates.map(update => new Promise((resolve, reject) => {
      const parameters = []
      let index = 0
      let set = []

      const mapValue = value => {
        index++
        parameters.push(inputValue(value))
        return `$${index}`
      }

      for (let field in update.replace) {
        const value = update.replace[field]
        index++
        if (Array.isArray(value)) parameters.push(value.map(inputValue))
        else parameters.push(inputValue(value))
        set.push(`"${field}" = $${index}`)
      }

      for (let field in update.push) {
        const value = update.push[field]
        index++

        if (Array.isArray(value)) {
          parameters.push(value.map(inputValue))
          set.push(`"${field}" = array_cat("${field}", $${index})`)
          continue
        }

        parameters.push(inputValue(value))
        set.push(`"${field}" = array_append("${field}", $${index})`)
      }

      for (let field in update.pull) {
        const value = update.pull[field]

        if (Array.isArray(value)) {
          // This array removal query is a modification from here:
          // http://www.depesz.com/2012/07/12/
          // waiting-for-9-3-add-array_remove-and-array_replace-functions/
          set.push(`"${field}" = array(select x from unnest("${field}") ` +
            `x where x not in (${value.map(mapValue).join(', ')}))`)
          continue
        }

        index++
        parameters.push(inputValue(value))
        set.push(`"${field}" = array_remove("${field}", $${index})`)
      }


      set = `set ${set.join(', ')}`

      index++
      parameters.push(update[primaryKey])
      const updateRecord = `update "` +
        (type in typeMap ? typeMap[type] : type) + `" ${set} ` +
        `where "${primaryKey}" = $${index}`

      client.query(updateRecord, parameters, (error, result) => {
        if (error) {
          const code = getCode(error)

          // If the record didn't exist, it's not an error.
          // http://www.postgresql.org/docs/8.2/static/errcodes-appendix.html
          if (code === '42703') return resolve(0)

          return reject(error)
        }

        return resolve(result.rowCount)
      })
    })))
    .then(results => {
      return results.reduce((num, result) => {
        num += result
        return num
      }, 0)
    })
  }


  delete (type, ids) {
    if (ids && !ids.length) return super.delete()

    const { keys: { primary: primaryKey },
      client, options: { typeMap } } = this
    let index = 0

    const deleteRecords = `delete from ` +
      `"${type in typeMap ? typeMap[type] : type}"` + (ids ?
      ` where "${primaryKey}" in ` +
      `(${ids.map(() => {
        index++
        return `$${index}`
      }).join(', ')})` : '')

    return new Promise((resolve, reject) =>
      client.query(deleteRecords, ids ? ids : null,
        (error, result) => error ? reject(error) : resolve(result.rowCount)))
  }

}
