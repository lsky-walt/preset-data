const path = require("path")

// get entry dir
const handleEntry = (entry) => {
  if (!entry) return null
  let baseDir = null
  Object.keys(entry).forEach((tar) => {
    const e = entry[tar]["import"].find(
      (v) =>
        v.indexOf("node_modules") === -1 &&
        v.indexOf("webpack-dev-server") === -1
    )
    baseDir = path.dirname(e)
  })
  return baseDir
}

function getType(data) {
  const string = Object.prototype.toString.call(data)

  if (!string) {
    return null
  }
  return string.replace("[object ", "").replace("]", "")
}

function isType(type) {
  return (obj) => getType(obj) === type
}

const isNull = isType("Null")
const isUndefined = isType("undefined")
const isArray = isType("Array")
const isObject = isType("Object")
const isNumber = isType("Number")
const isString = isType("String")
const isFunc = isType("Function")
const isDate = isType("Date")
const isError = isType("Error")
const isRegExp = isType("RegExp")
const isMap = isType("Map")
const isSet = isType("Set")
const isSymbol = isType("Symbol")
const isPromise = (obj) => isType("Promise")(obj) && isType("Function")(obj)
const isNan = (a) => a !== a

module.exports = {
  handleEntry,
  isNan,
  getType,
  isType,
  isNull,
  isUndefined,
  isArray,
  isObject,
  isNumber,
  isString,
  isFunc,
  isDate,
  isError,
  isRegExp,
  isMap,
  isSet,
  isSymbol,
  isPromise,
}
