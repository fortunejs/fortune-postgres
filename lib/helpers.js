'use strict'

const crypto = require('crypto')
const randomBytes = crypto.randomBytes

const primaryKeyTypes = new Set([ String, Number ])

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
  inputRecord, outputRecord, getCode
}


function inputValue (value) {
  // PostgreSQL expects a special encoding for buffers.
  if (Buffer.isBuffer(value)) return `\\x${value.toString('hex')}`

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
}


function outputBuffer (value) {
  if (Buffer.isBuffer(value)) return value
  return new Buffer(value.slice(2), 'hex')
}
