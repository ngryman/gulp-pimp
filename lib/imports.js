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
  this.stringReducer = opts.reducer || this.stringReducer
  this.dataReducer = opts.reducer || this.dataReducer
  this.outro = opts.outro || empty
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
    let output = ''
    output += this.intro()
    output = this.index.reduce(this.stringReducer.bind(this), output)
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
