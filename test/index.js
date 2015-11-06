/* eslint-disable no-var */
var testAdapter = require('fortune/test/adapter')
var adapter = require('../dist')

testAdapter(adapter, {
  url: 'postgres://postgres@localhost:5432/fortune_test',
  primaryKeyType: Number,
  useForeignKeys: true,
  generatePrimaryKey: function generatePrimaryKey () {
    return Math.floor(Math.random() * Math.pow(2, 32))
  },
  typeMapping: {
    user: 'users',
    animal: 'animals'
  }
})
