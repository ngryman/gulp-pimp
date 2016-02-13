# gulp-pimp [![npm][npm-image]][npm-url] [![travis][travis-image]][travis-url] [![coveralls][coveralls-image]][coveralls-url]

[npm-image]: https://img.shields.io/npm/v/gulp-pimp.svg?style=flat
[npm-url]: https://npmjs.org/package/gulp-pimp
[travis-image]: https://img.shields.io/travis/ngryman/gulp-pimp.svg?style=flat
[travis-url]: https://travis-ci.org/ngryman/gulp-pimp
[coveralls-image]: https://coveralls.io/repos/ngryman/gulp-pimp/badge.svg?service=github
[coveralls-url]: https://coveralls.io/github/ngryman/gulp-pimp

> Pimp your imports!

![](http://i.giphy.com/YjJZKbm2kNN7i.gif)


`pimp` discovers your modules/components/whatever and automatically imports them in the file you
want. You can then process it with the tool of your choice.
It supports `commonjs`, `sass`, `less`, `css` by default. You can customize everything, of course.

That's not all, `pimp` is also a [reducer],
so you can use it for other purposes than simply importing stuff. As it's compatible with all
plugins consuming [gulp-data], you can use it with template
engines for example.


## Install

```bash
npm install --save-dev gulp-pimp
```

## Usage

### Scripts

```javascript
gulp.src('app/components/*.js', { read: false })
  .pipe(pimp('app.js'))
  .pipe(browserify())
  .pipe(gulp.dest('dist/'));
```

`app.js` will contain:
```javascript
var a = require('app/components/a.js');
var b = require('app/components/b.js');
```

### CSS/SASS/LESS

```javascript
return gulp.src('app/components/_*.scss', { read: false })
  .pipe(pimp('app.scss'))
  .pipe(sass())
  .pipe(gulp.dest('dist/'));
```

`app.scss` will contain:
```scss
@import 'app/components/_a.scss';
@import 'app/components/_b.scss';
```

### Custom

```javascript
return gulp.src('app/components/*.html', { read: false })
  .pipe(pimp('index.html', (output, file) => output + `{% include '${path}' %}` ))
  .pipe(template())
  .pipe(gulp.dest('dist/'));
```

`index.html` will contain:
```html
{% include 'app/components/a.html' %}
{% include 'app/components/b.html' %}
```

## API

### pimp(manifest, [options])

#### `manifest` <sup><sub>`{string}`</sub></sup>

Name of the manifest file. If it already exists, imports are appended to the end of the file.
If not the file is created.

#### `options` <sup><sub>`{object|function}`</sub></sup>

Set of options. If a `function` is passed, this is equivalent to the [reducer](#reducer-function) option.

##### `rules` <sup><sub>`{object}`</sub></sup>

A set of rules to apply to input files.
A rule is a `key-value` pair. The `key` is a [glob] to match, and the `value`
is a template string that will be used to output the import statement.

The template string accepts several variables that will vary for each file being processed:
 - `${name}`: name of the file, without the extension
 - `${path}`: absolute path of the file

<b>Example</b>:
```javascript
pimp('app.js', {
  rules: {
    'components/*/*.js': "import ${name} from '${path}'"
  }
});
```

##### `reducer` <sup><sub>`{function}`</sub></sup>

The reducer gives you full control over statement substitution. It is called for each file.
The function has 2 arguments:
 - `output`: which is the final output of all statements, or the `data` attribute if [data](#user-content-data-booleanstring) is specified
 - `file`
   - `name`: name of the file, without the extension
   - `ext`: extension of the file
   - `basename`: name of the file, with the extension
   - `path`: absolute path of the file
   - `contents`: contents of the file as a `string`

As it's a reducer, make sure to always return `output`.

<b>Example</b>:
```javascript
pimp('index.html', (output, file) => output + `<script src="https://wootcdn.com/${path}"></script>`);
```

##### `intro` <sup><sub>`{function}`</sub></sup>

Executed just before the `reducer`, it gives you the ability to setup and prepend something to `output`.

##### `outro` <sup><sub>`{function}`</sub></sup>

Executed just after the `reducer`, it gives you the ability to cleanup and append something to `output`.

##### `data` <sup><sub>`{boolean|string}`</sub></sup>

Alters `pimp` behavior by adding a `data` attribute to the manifest file, without modifying its
content. This is mainly designed to be used with other plugins that consume [gulp-data].
If `data` is a `string`, collected files will be set in the given namespace (i.e. `data.components`).

`data` makes `pimp` switch of reducer. If you specify a custom `reducer`, it will take an object
as first argument, instead of a string. `intro` and `outro` will have no effect.

Note that you should remove `{ read: false }` when using this as you might actually need contents
of your collected files.

## Rules

But default, `pimp` comes with default rules:
```javascript
{
  '*.{scss,less,css}': "@import '${path}';",
  '*.{js,jsx}': "var ${name} = require('${path}');"
}
```

If you want to modify those default, you can alter the `pimp.RULES` object.

## Moar examples

### ES6

```javascript
pimp('app.js', {
  rules: {
    '*.js': 'import ${name} from ${path};'
  }
})
```

### AMD

```javascript
const components = []

pimp('app.js', {
  intro: () => 'define([',
  reducer: (output, file) => { components.push(file.name); return output + file.name },
  outro: () => `], function(${components.join(', '}) {\n});\n`
})
```

### Templates

This is an idea of what can be done using `data`.

Here is an `index.html` which will be processed by [gulp-template]:
```html
<body>
  <%= components.header %>
  <main>
    <%= components.content %>
    <%= components.aside %>
  </main>
  <%= components.footer %>
</body>
```

`pimp` collects components and passes then to `gulp-template`:
```
gulp.src('app/components/*/*.html')
  .pipe(pimp('index.html', { data: 'components' }))
  .pipe(template(pkg))
  .pipe(gulp.dest('dist/'))
```


## License

MIT © [Nicolas Gryman](http://ngryman.sh)

[reducer]: https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/reduce
[glob]: https://github.com/isaacs/node-glob#glob-primer
[gulp-data]: https://github.com/colynb/gulp-data
[gulp-template]: https://github.com/sindresorhus/gulp-template
