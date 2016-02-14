import pimp from '../'
import test from 'ava'
import assert from 'stream-assert'
import array from 'stream-array'
import { File } from 'gulp-util'

test('throws when no index file is specified', t => {
  t.throws(() => {
    pimp()
  })
})

test.cb('creates an index file when it does not exists', t => {
  testStream('_reset.scss')
    .pipe(pimp('index.scss'))
    .pipe(assert.length(1))
    .pipe(assert.first(
      d => t.same(d.contents.toString(), "@import '/foo/bar/_reset.scss';\n"))
    )
    .pipe(assert.end(t.end))
})

test.cb('appends imports to an existing index file', t => {
  testStream('header.js', 'footer.js')
    .pipe(pimp('fixtures/app.js'))
    .pipe(assert.length(1))
    .pipe(assert.first(
      d => t.same(d.contents.toString(),
        "/** Cornflakes */\nvar header = require('/foo/bar/header.js');\n" +
        "var footer = require('/foo/bar/footer.js');\n"
      )
    ))
    .pipe(assert.end(t.end))
})

test.cb('replaces rules when specified', t => {
  testStream('woot.js', 'wut.scss')
    .pipe(pimp('app.js', {
      rules: {
        '*.js': '^${path}^\n\n',
        '*.scss': '^${name}^\n\n'
      }
    }))
    .pipe(assert.length(1))
    .pipe(assert.first(
      d => t.same(d.contents.toString(), '^/foo/bar/woot.js^\n\n^wut^\n\n')
    ))
    .pipe(assert.end(t.end))
})

test.cb('accepts a reducer in place of options', t => {
  testStream('a.js', 'b.js')
    .pipe(pimp('app.js', (output, file) => output + file.name))
    .pipe(assert.length(1))
    .pipe(assert.first(
      d => t.same(d.contents.toString(), 'ab')
    ))
    .pipe(assert.end(t.end))
})

test.cb('passes a data property', t => {
  testStream(['a.js', 'content'])
    .pipe(pimp('app.js', { data: true }))
    .pipe(assert.first(d => {
      t.is(typeof d.data, 'object')
      t.is(d.data.a, 'content')
    }))
    .pipe(assert.end(t.end))
})

test.cb('passes a deep data property', t => {
  testStream(['a.js', 'content'])
    .pipe(pimp('app.js', { data: 'components' }))
    .pipe(assert.first(d => {
      t.is(typeof d.data, 'object')
      t.is(typeof d.data.components, 'object')
      t.is(d.data.components.a, 'content')
    }))
    .pipe(assert.end(t.end))
})

function testStream(...files) {
  return array(files.map(file => {
    let name, contents
    if (Array.isArray(file)) {
      name = file[0]
      contents = new Buffer(file[1])
    }
    else {
      name = file
    }

    return new File({
      cwd: '/foo',
      base: '/foo/bar',
      path: `/foo/bar/${name}`,
      contents
    })
  }))
}
