'use strict'

const through2 = require('through2')
const Imports = require('./lib/imports')
const util = require('gulp-util')
const fs = require('fs')
const path = require('path')

const pimp = function(file, opts) {
  if (!file) {
    throw new util.PluginError('pimp', 'No index file specified')
  }

  opts = opts || {}

  if ('function' === typeof opts) {
    opts = {
      reducer: opts
    }
  }

  const imports = new Imports(opts)

  let indexFile = new util.File({
    path: path.join(process.cwd(), file),
    contents: fs.existsSync(file) ? fs.readFileSync(file) : null
  })

  return through2.obj(function(file, encoding, callback) {
    imports.push(file)
    callback()
  }, function(callback) {
    const statements = new Buffer(imports.toString())

    if (statements.length > 0) {
      if (Buffer.isBuffer(indexFile.contents)) {
        indexFile.contents = Buffer.concat([indexFile.contents, statements])
      }
      else {
        indexFile.contents = statements
      }

      this.push(indexFile)
    }

    callback()
  })
}

pimp.Imports = Imports

module.exports = pimp
