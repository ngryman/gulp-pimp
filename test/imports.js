import Imports from '../lib/imports'
import test from 'ava'

const createFile = (filename) => {
  return {
    relative: `${filename}`,
    path: `/foo/${filename}`
  }
}

test('pushes a file', t => {
  const imports = new Imports()
  imports.push(createFile('app/index.js'))

  t.same(imports.index[0], {
    name: 'index',
    ext: '.js',
    basename: 'index.js',
    path: '/foo/app/index.js',
    contents: undefined
  })
})

test('automatically seralizes javascript imports', t => {
  const imports = new Imports()
  imports.push(createFile('index.js'))

  t.same(imports.toString(), "var index = require('/foo/index.js');\n")
})

test('automatically seralizes sass imports', t => {
  const imports = new Imports()
  imports.push(createFile('sass/_reset.scss'))
  imports.push(createFile('sass/_mixins.scss'))

  t.same(imports.toString(),
    "@import '/foo/sass/_reset.scss';\n@import '/foo/sass/_mixins.scss';\n"
  )
})

test('returns an empty string when no imports was pushed', t => {
  const imports = new Imports()

  t.same(imports.toString(), '')
})

test('accepts custom rules', t => {
  const imports = new Imports({
    rules: {
      '_reset.scss': 'Sapristi!'
    }
  })
  imports.push(createFile('sass/_reset.scss'))
  imports.push(createFile('sass/_mixins.scss'))

  t.same(imports.toString(), "Sapristi!@import '/foo/sass/_mixins.scss';\n")
})

test('accepts custom rules with a function handler', t => {
  const imports = new Imports({
    rules: {
      '_reset.scss': (file, glob) => file.path
    }
  })
  imports.push(createFile('sass/_reset.scss'))

  t.same(imports.toString(), '/foo/sass/_reset.scss')
})

test('accepts a custom reducer ', t => {
  const imports = new Imports({
    reducer: (output, file) => output + file.name
  })
  imports.push(createFile('sass/_reset.scss'))
  imports.push(createFile('sass/_mixins.scss'))

  t.same(imports.toString(), '_reset_mixins')
})

test('accepts an intro function ', t => {
  const imports = new Imports({
    intro: (output) => 'BRAINZ'
  })
  imports.push(createFile('sass/_reset.scss'))

  t.same(imports.toString(), "BRAINZ@import '/foo/sass/_reset.scss';\n")
})

test('accepts an outro function ', t => {
  const imports = new Imports({
    outro: (output) => 'BRAINZ'
  })
  imports.push(createFile('sass/_reset.scss'))

  t.same(imports.toString(), "@import '/foo/sass/_reset.scss';\nBRAINZ")
})

test('reduces to an object', t => {
  const imports = new Imports()
  imports.push(createFile('sass/_reset.scss'))
  imports.push(createFile('sass/_mixins.scss'))

  t.same(imports.toData(), {
    _reset: {
      name: '_reset',
      ext: '.scss',
      basename: '_reset.scss',
      path: '/foo/sass/_reset.scss',
      contents: undefined
    },
    _mixins: {
      name: '_mixins',
      ext: '.scss',
      basename: '_mixins.scss',
      path: '/foo/sass/_mixins.scss',
      contents: undefined
    }
  })
})
