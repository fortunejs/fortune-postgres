# Changelog


##### 1.6.5 (2018-09-05)
- Fix: invalid format for JSON arrays.


##### 1.6.4 (2018-03-05)
- Fix: use a single client instance during a transaction.
- Bump `pg` dependency major version.


##### 1.6.3 (2017-08-14)
- Fix: inconsistent behavior when casting buffers.


##### 1.6.2 (2017-08-13)
- Polish: ignore creating non-enumerable fields if they are not denormalized inverse fields.
- Polish: allow `sslmode=require` query parameter for SSL.


##### 1.6.1 (2017-07-12)
- Fix: ignore errors that may occur if default database `postgres` does not exist.


##### 1.6.0 (2017-06-11)
- Feature: attempt to automatically create the database, so that this setup does not need to be done beforehand.


##### 1.5.1 (2017-05-10)
- Fix: alias `adapter.client` to `adapter.pool` for backwards compatibility. However, this should be considered private API.


##### 1.5.0 (2017-05-10)
- Feature: allow connection object or an instance of `node-pg-pool` to be passed in directly.


##### 1.4.8 (2017-05-10)
- Refactor: use `pool` API.


##### 1.4.6 (2016-08-23)
- Feature: proper support for custom types.


##### 1.4.4 (2016-08-23)
- Fix: check for type constructor.
- Polish: update dependencies.


##### 1.4.3 (2016-08-04)
- Polish: update dependencies.


##### 1.4.2 (2016-06-04)
- Polish: update dependencies.


##### 1.4.1 (2016-04-14)
- Fix: add default value as empty array when altering array columns.


##### 1.4.0 (2016-01-29)
- Feature: implement transactions.


##### 1.3.1 (2016-01-23)
- Feature: implement `range` option.
- Feature: implement `exists` option.
- Polish: add `not null` constraint on array fields.
- Polish: remove transpiler.


##### 1.2.4 (2015-12-31)
- Polish: make common table expression optional in create method.
- Fix: assign primary key after creating records if they are not supplied.
- Fix: improve support for numeric primary key types.
- Fix: change type of foreign keys for serial primary keys.
- Fix: omit `primaryKey` in create method if all IDs are missing.


##### 1.2.0 (2015-12-30)
- Feature: allow strings for `primaryKeyType`.
- Feature: allow `generatePrimaryKey` to be disabled.


##### 1.1.2 (2015-09-14)
- Fix: sort array fields by array length.


##### 1.1.1 (2015-09-12)
- Add parameters as second argument to `query` function.


##### 1.1.0 (2015-09-12)
- Breaking change: `query` field now accepts a function.


##### 1.0.13 (2015-09-10)
- Fix array containment query.


##### 1.0.12 (2015-09-08)
- Fix array of buffers input/output.


##### 1.0.8 (2015-08-26)
- Rename `typeMapping` to `typeMap`.


##### 1.0.7 (2015-08-24)
- Fix: `null` option bug.


##### 1.0.6 (2015-08-21)
- Feature: add missing columns on table if they don't exist yet.


##### 1.0.4 (2015-08-07)
- Bump dependency versions, use semver.
- Feature: add `typeMapping` option.


##### 1.0.2 (2015-07-17)
- Bump versions.
- Renamed package to `fortune-postgres`.


##### 1.0.1 (2015-07-02)
- Add option for foreign key constraint on non-array links. PostgreSQL itself may support foreign keys for array values in the future.


##### 1.0.0 (2015-06-29)
- Fix sort input.
- Fix update no-op.
- Moved `pg-native` as an optional dependency, no longer default.


##### 1.0.0-alpha.1 (2015-06-21)
- Initial release.
