# fortune-relational

This is a relational database adapter for [Fortune](http://github.com/daliwali/fortune).

**Note**: Arrays of types are not allowed, and will be cast into a singular type, so `[String]` becomes `String`, `[Number]` becomes `Number`, etc.

### Usage

Install the `fortune-relational` package from `npm`:
```
$ npm install fortune-relational
```

Then configure your app to use it:
```js
var app = fortune({
  adapter: 'mysql' // or 'psql' or 'sqlite'
});
```

### Meta

This software is licensed under the [MIT License](//github.com/daliwali/fortune-relational/blob/master/LICENSE.md).
