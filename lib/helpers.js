import { randomBytes } from 'crypto'


export const primaryKeyTypes = new Set([ String, Number ])


export const postgresTypeMap = new WeakMap([
  [ String, 'text' ],
  [ Number, 'double precision' ],
  [ Boolean, 'boolean' ],
  [ Date, 'timestamp' ],
  [ Object, 'jsonb' ],
  [ Buffer, 'bytea' ]
])


export function inputValue (value) {
  // PostgreSQL expects a special encoding for buffers.
  if (Buffer.isBuffer(value)) return `\\x${value.toString('hex')}`

  return value
}


export function inputRecord (type, record) {
  const { recordTypes, keys, options } = this
  const fields = recordTypes[type]
  let generatePrimaryKey = options.generatePrimaryKey || defaultPrimaryKey

  if (!(keys.primary in record))
    record[keys.primary] = generatePrimaryKey(type)

  for (let field in fields) {
    const isArray = fields[field][keys.isArray]

    if (!(field in record)) {
      record[field] = isArray ? [] : null
      continue
    }

    record[field] = inputValue(record[field])
  }

  return record
}


export function outputRecord (type, record) {
  const { recordTypes, keys } = this
  const fields = recordTypes[type]
  const clone = {}

  for (let field in fields) {
    const fieldType = fields[field][keys.type]
    const value = record[field]

    if (fields[field][keys.denormalizedInverse]) {
      Object.defineProperty(clone, field, { value,
        writable: true, configurable: true })
      continue
    }

    if (fieldType === Buffer && value && !Buffer.isBuffer(value)) {
      clone[field] = new Buffer(value.slice(2), 'hex')
      continue
    }

    if (field in record) clone[field] = value
  }

  clone[keys.primary] = record[keys.primary]

  return clone
}


export function getCode (error) {
  return error.code || error.sqlState
}


function defaultPrimaryKey () {
  return randomBytes(15).toString('base64')
}
