const testAdapter = require('fortune/test/adapter')
const adapter = require('../lib')

testAdapter(adapter, {
  url: 'postgres://postgres@localhost:5432/fortune_test',
  // isNative: true,
  primaryKeyType: 'integer',
  useForeignKeys: true,
  generatePrimaryKey: () => Math.floor(Math.random() * Math.pow(2, 16)),
  typeMap: {
    user: 'users',
    animal: 'animals'
  }
})
