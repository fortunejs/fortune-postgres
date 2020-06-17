'use strict'

const crypto = require('crypto')
const randomBytes = crypto.randomBytes

const primaryKeyTypes = new Set([ String, Number ])
const buffer = Buffer.from ||
  ((input, encoding) => {
    return new Buffer(input, encoding)
  })

const postgresTypeMap = new WeakMap([
  [ String, 'text' ],
  [ Number, 'double precision' ],
  [ Boolean, 'boolean' ],
  [ Date, 'timestamp' ],
  [ Object, 'jsonb' ],
  [ Buffer, 'bytea' ]
])


module.exports = {
  primaryKeyTypes, postgresTypeMap, inputValue,
  inputRecord, outputRecord, getCode, constructFilterRelationQuery, constructTypesPathToChild, isRelationFilter, getRelationFilterSegments
}


function inputValue (value) {
  // PostgreSQL expects a special encoding for buffers.
  if (Buffer.isBuffer(value)) return `\\x${value.toString('hex')}`

  // Array objects need to be stringified. See:
  // https://github.com/brianc/node-postgres/issues/1143
  if (Array.isArray(value)) return JSON.stringify(value)

  return value
}


function inputRecord (type, record) {
  const recordTypes = this.recordTypes
  const options = this.options
  const primaryKey = this.keys.primary
  const isArrayKey = this.keys.isArray
  const fields = recordTypes[type]
  const generatePrimaryKey = 'generatePrimaryKey' in options ?
    options.generatePrimaryKey : defaultPrimaryKey

  if (!(primaryKey in record) && generatePrimaryKey)
    record[primaryKey] = generatePrimaryKey(type)

  for (const field in fields) {
    const isArray = fields[field][isArrayKey]

    if (!(field in record)) {
      record[field] = isArray ? [] : null
      continue
    }

    record[field] = isArray ?
      record[field].map(inputValue) : inputValue(record[field])
  }

  return record
}


function outputRecord (type, record) {
  const recordTypes = this.recordTypes
  const primaryKey = this.keys.primary
  const isArrayKey = this.keys.isArray
  const typeKey = this.keys.type
  const denormalizedInverseKey = this.keys.denormalizedInverse
  const fields = recordTypes[type]
  const clone = {}

  for (const field in fields) {
    const fieldType = fields[field][typeKey]
    const fieldIsArray = fields[field][isArrayKey]
    const value = record[field]

    if (fields[field][denormalizedInverseKey]) {
      Object.defineProperty(clone, field, { value,
        writable: true, configurable: true })
      continue
    }

    if (fieldType &&
      (fieldType === Buffer || fieldType.prototype.constructor === Buffer) &&
      value && !Buffer.isBuffer(value)) {
      clone[field] = fieldIsArray ?
        value.map(outputBuffer) : outputBuffer(value)
      continue
    }

    if (field in record) clone[field] = value
  }

  clone[primaryKey] = record[primaryKey]

  return clone
}


function getCode (error) {
  return error.code || error.sqlState
}


function defaultPrimaryKey () {
  return randomBytes(15).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_')
}


function outputBuffer (value) {
  if (Buffer.isBuffer(value)) return value
  return buffer(value.slice(2), 'hex')
}


function constructFilterRelationQuery( tableSetupConfiguration,
                                       typeMap,
                                       recordTypes,
                                       typesPathToParent,
                                       pathSegmentsToParent,
                                       whereOperation,
                                       value,
                                       query = '' ){

  if( !typesPathToParent.length ){
    return query
  }

  const primaryKey = tableSetupConfiguration.keys.primary
  const pathSegment = pathSegmentsToParent[0]
  const currentType = typesPathToParent[0]
  if(!query){
    query = `SELECT ${primaryKey} FROM "${typeMap[currentType] || currentType}" WHERE ${whereOperation(pathSegment, value)} \n`
  }
  else {
    const recordType = recordTypes[currentType]
    if(!recordType[pathSegment].isArray) {
      query = `SELECT ${primaryKey} FROM "${typeMap[currentType] || currentType}" WHERE  "${pathSegment}" IN ( ${query} ) \n`
    }
    else{
      query = `SELECT ${primaryKey} FROM "${typeMap[currentType] || currentType}" WHERE  "${pathSegment}" && ARRAY( ${query} ) \n`
    }
  }

  return constructFilterRelationQuery( tableSetupConfiguration,
                                       typeMap,
                                       recordTypes,
                                       typesPathToParent.slice(1),
                                       pathSegmentsToParent.slice(1),
                                       whereOperation,
                                       value,
                                       query)
}


function constructTypesPathToChild( recordTypes, parent, remainingPathSegments, typesPath ){
  if( !remainingPathSegments.length ){
    return typesPath
  }

  const segment = remainingPathSegments[0]
  const nextType = parent[segment].link

  //complex type
  if( nextType ){
    typesPath.push( nextType )
    parent = recordTypes[nextType]
  }
  return constructTypesPathToChild(recordTypes, parent, remainingPathSegments.slice(1), typesPath )
}


function isRelationFilter( field ){
  return field.split(':').length > 1
}


function getRelationFilterSegments( field ){
  return field.split(':')
}
