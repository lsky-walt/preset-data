const path = require("path")
const { handleEntry } = require("./tools")
const name = "preset-data"
const moduleName = "@lsky/preset-data"

let baseDir = null
const importRegExp = /import.*('|")@lsky\/preset-data('|")/g

const handleFilePath = (relativePath) => {
  if (!relativePath) return `./${name}.js`
  return `${relativePath}/${name}.js`
}

const handleSourceCode = (str, relativePath) => {
  let t = str
  if (t && t.indexOf(moduleName) !== -1) {
    // replace import
    const [importString] = t.match(importRegExp)
    if (importString) {
      const afterReplace = importString.replace(
        /('|")@lsky\/preset-data('|")/g,
        `'${relativePath}'`
      )
      t = t.replace(importRegExp, afterReplace)
    }
  }
  return t
}

module.exports = function (source) {
  this.cacheable()
  if (!baseDir) {
    const { entry } = this._compiler.options
    baseDir = handleEntry(entry)
  }
  let relativePath = path.relative(this.context, baseDir)
  relativePath = handleFilePath(relativePath)
  return handleSourceCode(source, relativePath)
}
