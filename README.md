# fortune-relational

This is a relational database adapter for [Fortune](http://github.com/daliwali/fortune).

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
