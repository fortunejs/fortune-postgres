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
  const { recordTypes, keys: {
    primary: primaryKey, isArray: isArrayKey
  }, options } = this
  const fields = recordTypes[type]
  let generatePrimaryKey = options.generatePrimaryKey || defaultPrimaryKey

  if (!(primaryKey in record))
    record[primaryKey] = generatePrimaryKey(type)

  for (let field in fields) {
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


export function outputRecord (type, record) {
  const { recordTypes, keys: {
    primary: primaryKey, type: typeKey, isArray: isArrayKey,
    denormalizedInverse: denormalizedInverseKey
  } } = this
  const fields = recordTypes[type]
  const clone = {}

  for (let field in fields) {
    const fieldType = fields[field][typeKey]
    const fieldIsArray = fields[field][isArrayKey]
    const value = record[field]

    if (fields[field][denormalizedInverseKey]) {
      Object.defineProperty(clone, field, { value,
        writable: true, configurable: true })
      continue
    }

    if (fieldType === Buffer && value && !Buffer.isBuffer(value)) {
      clone[field] = fieldIsArray ?
        value.map(outputBuffer) : outputBuffer(value)
      continue
    }

    if (field in record) clone[field] = value
  }

  clone[primaryKey] = record[primaryKey]

  return clone
}


export function getCode (error) {
  return error.code || error.sqlState
}


function defaultPrimaryKey () {
  return randomBytes(15).toString('base64')
}


function outputBuffer (value) {
  if (Buffer.isBuffer(value)) return value
  return new Buffer(value.slice(2), 'hex')
}
