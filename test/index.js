require('fortune/dist/test/unit/adapter')(
  require('../dist'), {
    url: 'postgres://postgres@localhost:5432/fortune_test',
    primaryKeyType: Number,
    generatePrimaryKey: function generatePrimaryKey () {
      return Math.floor(Math.random() * Math.pow(2, 32))
    }
  })
