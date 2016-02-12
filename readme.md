# gulp-pimp [![npm][npm-image]][npm-url] [![travis][travis-image]][travis-url] [![coveralls][coveralls-image]][coveralls-url]

[npm-image]: https://img.shields.io/npm/v/gulp-pimp.svg?style=flat
[npm-url]: https://npmjs.org/package/gulp-pimp
[travis-image]: https://img.shields.io/travis/ngryman/gulp-pimp.svg?style=flat
[travis-url]: https://travis-ci.org/ngryman/gulp-pimp
[coveralls-image]: https://coveralls.io/repos/ngryman/gulp-pimp/badge.svg?service=github
[coveralls-url]: https://coveralls.io/github/ngryman/gulp-pimp

> Pimp your imports!

![](http://i.giphy.com/YjJZKbm2kNN7i.gif)


`pimp` uses the power of `gulp` to discover your modules/components/whatever and automatically
import them in your main file. Then you can process those imports with the tool of your choice.

This allows you to develop in a modular way and split your files however you like, without having
to maintain some sort of *manifest* somewhere in your app.

It supports `commonjs`, `sass`, `less`, `css` by default. But you can customize it of course.

You can also use `pimp` as a [reducer](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/reduce)
of input files to an output file.


## Install

```bash
npm install --save-dev gulp-import
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

Name of the manifest file. If the file already exists, imports are appended to the end.
If not the file is created.

#### `options` <sup><sub>`{object|function}`</sub></sup>

Set of options. If a `function` is passed, this is equivalent to the [reducer](#reducer-function) option.

##### `rules` <sup><sub>`{object}`</sub></sup>

A set of rules to apply to input files.
A rule is a `key-value` pair. The `key` is a [glob](https://github.com/isaacs/node-glob#glob-primer) to match, and the `value`
is a template string that will be used to output the import statement.

The template string accepts several variables that will vary for each file being processed:
 - `${name}`: name of the file, without the extention
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
 - `output`: which is the final output of all statements
 - `file`
   - `name`: name of the file, without the extension
   - `ext`: extension of the file
   - `basename`: name of the file, with the extension
   - `path`: absolute path of the file

As it's a reducer, make sure to always return `output`.

<b>Example</b>:
```javascript
pimp('index.html', (output, file) => output + `<script src="https://wootcdn.com/${path}"></script>`);
```

##### `intro` <sup><sub>`{function}`</sub></sup>

Executed just before the `reducer`, it gives you the ability to setup and prepend something to `output`.

##### `outro` <sup><sub>`{function}`</sub></sup>

Executed just after the `reducer`, it gives you the ability to cleanup and append something to `output`.

## Rules

But default, `pimp` comes with default rules:
```javascript
{
  '*.{scss,css}': "@import '${path}';",
  '*.{js,jsx}': "var ${name} = require('${path}');"
}
```

If you want to aler those default, you can alter the `pimp.RULES` object.

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


## License

MIT © [Nicolas Gryman](http://ngryman.sh)
