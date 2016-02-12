'use strict'

const micromatch = require('micromatch')
const defaults = require('object-defaults')

const RULES = {
  '*.{scss,less,css}': "@import '${path}';\n",
  '*.{js,jsx}': "var ${name} = require('${path}');\n"
}

const empty = () => ''

function Imports(opts) {
  opts = opts || {}

  this.index = []
  this.rules = defaults({}, opts.rules, RULES)
  this.intro = opts.intro || empty
  this.reducer = opts.reducer || this.reducer
  this.outro = opts.outro || empty
}

Imports.prototype = {
  push: function(file) {
    const relative = file.relative
    const basename = relative.slice(relative.lastIndexOf('/') + 1)
    const ext = basename.slice(basename.lastIndexOf('.'))
    const name = basename.replace(ext, '')

    this.index.push({ name, ext, basename, path: file.path })
  },

  toString() {
    let output = ''
    output += this.intro()
    output = this.index.reduce(this.reducer.bind(this), output)
    output += this.outro()
    return output
  },

  reducer(output, file) {
    return output + this.statement(file)
  },

  statement(file) {
    for (let glob in this.rules) {
      const statement = this.rules[glob]

      if ('function' === typeof statement) {
        const res = statement(file, glob)
        if (res) return res
      }
      else if (micromatch.isMatch(file.basename, glob)) {
        return this.rules[glob]
          .replace('${name}', file.name)
          .replace('${path}', file.path)
      }
    }
  }
}

module.exports = Imports
