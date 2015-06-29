# Fortune PostgreSQL Adapter

[![Build Status](https://img.shields.io/travis/fortunejs/fortune-pg/master.svg?style=flat-square)](https://travis-ci.org/fortunejs/fortune-pg)
[![npm Version](https://img.shields.io/npm/v/fortune-pg.svg?style=flat-square)](https://www.npmjs.com/package/fortune-pg)
[![License](https://img.shields.io/npm/l/fortune-pg.svg?style=flat-square)](https://raw.githubusercontent.com/fortunejs/fortune-pg/master/LICENSE)

This is a PostgreSQL adapter for Fortune. To use this adapter, the [user](http://www.postgresql.org/docs/9.1/static/app-createuser.html) and [database](http://www.postgresql.org/docs/9.4/static/app-createdb.html) must be setup prior to attempting to connect.

```
$ createuser [username]
$ createdb [dbname]
```


## Requirements

- PostgreSQL version **9.4** or newer. Older versions are untested and will not work.


## Usage

Install the `fortune-pg` package from `npm`:

```
$ npm install fortune-pg
```

Then use it with Fortune:

```js
import Fortune from 'fortune'
import pgAdapter from 'fortune-pg'

const fortune = new Fortune({
  adapter: {
    type: pgAdapter,
    options: {
      url: `postgres://${username}:${password}@${host}:${port}/${db}`
    }
  }
})
```


## Options

- `url`: Connection URL string. Required.
- `isNative`: Whether or not to use native bindings, requires `pg-native` module, which is an optional dependency of this one. Default: `false`.
- `primaryKeyType`: Data type of the primary key. May either `String` or `Number`. Default: `String`.
- `generatePrimaryKey`: A function that accepts one argument, the `type` of the record, and returns either a `String` or `Number`. By default, it returns 15 random bytes, base64 encoded.


## Caveats

The `query` field for the `options` object should be a string containing arbitrary SQL. It's not recommended to allow direct user input for this, for obvious reasons (SQL injection).


## License

This software is licensed under the [MIT License](//github.com/fortunejs/fortune-pg/blob/master/LICENSE).
