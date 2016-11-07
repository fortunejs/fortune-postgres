# Fortune Postgres Adapter

[![Build Status](https://img.shields.io/travis/fortunejs/fortune-postgres/master.svg?style=flat-square)](https://travis-ci.org/fortunejs/fortune-postgres)
[![npm Version](https://img.shields.io/npm/v/fortune-postgres.svg?style=flat-square)](https://www.npmjs.com/package/fortune-postgres)
[![License](https://img.shields.io/npm/l/fortune-postgres.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-postgres/master/LICENSE)

This is a Postgres adapter for Fortune. To use this adapter, the [user](http://www.postgresql.org/docs/9.4/static/app-createuser.html) and [database](http://www.postgresql.org/docs/9.4/static/app-createdb.html) must be setup prior to attempting to connect.

```
$ createuser [username]
$ createdb [dbname]
```

*This adapter, along with Fortune.js, does not implement ORM. This adapter sets up tables, and translates the adapter interface directly into SQL statements. It is a plain query builder for Postgres.*


## Requirements

- Postgres version **9.4** or newer. Older versions are untested and will not work.


## Usage

Install the `fortune-postgres` package from `npm`:

```
$ npm install fortune-postgres
```

Then use it with Fortune:

```js
const fortune = require('fortune')
const postgresAdapter = require('fortune-postgres')

const store = fortune({ ... }, {
  adapter: [
    postgresAdapter,
    {
      // options object, URL is mandatory.
      url: `postgres://${username}:${password}@${host}:${port}/${db}`
    }
  ]
})
```


## Options

- `url`: Connection URL string. Required.
- `isNative`: Whether or not to use native bindings, requires `pg-native` module, which is an optional dependency of this one. Default: `false`.
- `typeMap`: an object keyed by type name and valued by table name.
- `primaryKeyType`: Data type of the primary key. May be `String`, `Number`, or a string for custom type. Default: `String`.
- `generatePrimaryKey`: A function that accepts one argument, the `type` of the record, and returns either a `String` or `Number`. By default, it returns 15 random bytes, base64 encoded. Set this to a falsy value like `null` to turn this off.
- `useForeignKeys`: Whether or not to use foreign key constraint, optional since it will only be applied to non-array fields. Default: `false`.


## Extension

The `query` field for the `options` object should be a function that accepts two arguments, the prepared SQL query and parameters, and returns an SQL query.


## Internal Usage

The database client is exposed as the `client` property on the adapter instance, so for example, `store.adapter.client` lets you use the Postgres driver directly.


## License

This software is licensed under the [MIT License](//github.com/fortunejs/fortune-postgres/blob/master/LICENSE).
