# Changelog


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
