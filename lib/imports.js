'use strict'

const micromatch = require('micromatch')
const defaults = require('object-defaults')

const RULES = {
  '*.{scss,less,css}': "@import '${path}';\n",
  '*.{js,jsx}': "var ${name} = require('${path}');\n"
}

function empty() { return '' }

function Imports(opts) {
  defaults(this, opts, {
    intro: empty,
    outro: empty
  })

  this.rules = defaults(this.rules, RULES)

  this.stringReducer = this.reducer || this.stringReducer
  this.dataReducer = this.reducer || this.dataReducer
  delete this.reducer

  this.index = []
}

Imports.prototype = {
  push: function(file) {
    const relative = file.relative
    const basename = relative.slice(relative.lastIndexOf('/') + 1)
    const ext = basename.slice(basename.lastIndexOf('.'))
    const name = basename.replace(ext, '')

    this.index.push({ name, ext, basename, path: file.path, contents: file.contents })
  },

  toString() {
    let output = this.index.reduce(this.stringReducer.bind(this), this.intro())
    output += this.outro()
    return output
  },

  toData() {
    return this.index.reduce(this.dataReducer.bind(this), {})
  },

  stringReducer(output, file) {
    return output + this.statement(file)
  },

  dataReducer(data, file) {
    data[file.name] = file.contents ? file.contents.toString() : file
    return data
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
