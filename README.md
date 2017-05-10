# Fortune Postgres Adapter

[![Build Status](https://img.shields.io/travis/fortunejs/fortune-postgres/master.svg?style=flat-square)](https://travis-ci.org/fortunejs/fortune-postgres)
[![npm Version](https://img.shields.io/npm/v/fortune-postgres.svg?style=flat-square)](https://www.npmjs.com/package/fortune-postgres)
[![License](https://img.shields.io/npm/l/fortune-postgres.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-postgres/master/LICENSE)

This is a Postgres adapter for Fortune which makes use of specific Postgres functionality. Key features include:

- **Non-destructive table setup**: it will create tables and columns automatically upon connection, but will not alter columns. Data migrations are not handled by this adapter.
- **Emulates array foreign keys**: this adapter will *not* create junction tables, but instead create array columns, which is much faster than joins but lacks a database-level foreign key constraint, this is delegated to Fortune.
- **SQL query building**: it interprets arguments from Fortune's adapter interface directly, and generates optimized queries.

To use this adapter, the [user](http://www.postgresql.org/docs/9.4/static/app-createuser.html) and [database](http://www.postgresql.org/docs/9.4/static/app-createdb.html) must be setup prior to attempting to connect.

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

- `url`: Connection URL string. **Required** if no other connection options are given.
- `connection`: Connection object, see [documentation](https://github.com/brianc/node-pg-pool). This takes precendence over the URL. Optional.
- `pool`: an instance of `node-pg-pool` can be passed in directly. This takes precendence over all connection settings. Optional.
- `isNative`: Whether or not to use native bindings, requires `pg-native` module, which is an optional dependency of this one. Default: `false`.
- `typeMap`: an object keyed by type name and valued by table name.
- `primaryKeyType`: Data type of the primary key. May be `String`, `Number`, or a string for custom type. Default: `String`.
- `generatePrimaryKey`: A function that accepts one argument, the `type` of the record, and returns either a `String` or `Number`. By default,
  it returns 15 random bytes, base64 encoded in a URI-safe way. Set this to a falsey value like `null` to turn this off.
- `useForeignKeys`: Whether or not to use foreign key constraint, optional since it will only be applied to non-array fields. Default: `false`.


## Extension

The `query` field for the `options` object should be a function that accepts two arguments, the prepared SQL query and parameters, and returns an SQL query.


## Internal Usage

The database client pool is exposed as the `pool` property on the adapter instance, so for example, `store.adapter.pool` lets you use the Postgres driver directly.

For more on the API of the `pool` object, refer to [the node-pg-pool documentation](https://github.com/brianc/node-pg-pool).


## License

This software is licensed under the [MIT License](//github.com/fortunejs/fortune-postgres/blob/master/LICENSE).
