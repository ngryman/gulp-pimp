'use strict'

const through2 = require('through2')
const Imports = require('./lib/imports')
const util = require('gulp-util')
const fs = require('fs')
const path = require('path')

const pimp = function(manifest, opts) {
  if (!manifest) {
    throw new util.PluginError('pimp', 'No index file specified')
  }

  opts = opts || {}

  if ('function' === typeof opts) {
    opts = {
      reducer: opts
    }
  }

  const imports = new Imports(opts)

  let manifestFile = new util.File({
    path: path.join(process.cwd(), manifest),
    contents: fs.existsSync(manifest) ? fs.readFileSync(manifest) : null
  })

  return through2.obj(function(file, encoding, callback) {
    imports.push(file)
    callback()
  }, function(callback) {
    const statements = new Buffer(imports.toString())
    if (statements.length > 0) {
      if (Buffer.isBuffer(manifestFile.contents)) {
        manifestFile.contents = Buffer.concat([manifestFile.contents, statements])
      }
      else {
        manifestFile.contents = statements
      }
    }

    if (opts.data) {
      manifestFile.data = {}
      if ('string' === typeof opts.data) {
        manifestFile.data[opts.data] = imports.toData()
      }
      else {
        manifestFile.data = imports.toData()
      }
    }

    this.push(manifestFile)
    callback()
  })
}

pimp.Imports = Imports

module.exports = pimp
