const axios = require("axios")
// const crypto = require("crypto")
const chalk = require("chalk")
const fs = require("fs")
const path = require("path")
const { handleEntry, isArray, isObject, isString } = require("./tools")

const pluginName = "PresetDataPlugin"
let baseDir = null

const handleOptions = (options) => {
  if (!options) return []
  if (isArray(options)) return options
  if (isObject(options)) return [options]
  return []
}

const handleRequest = (options) => {
  function optionsMap(item = {}) {
    const { cb, ...opts } = item
    console.log(`Preset data from ${chalk.green(opts.url)}.`)
    return axios(opts)
  }
  return Promise.all(handleOptions(options).map(optionsMap))
}

module.exports = class PresetDataPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync("presetData", (compilation, cb) => {
      baseDir = handleEntry(compilation.options.entry)
      console.log(baseDir)

      handleRequest(this.options)
        .then((ds) => {
          let rawOptions = handleOptions(this.options)

          const result = ds
            .map((d, index) => {
              const target = rawOptions[index]
              let data = target.cb(d)
              if (isObject(data) || isArray(data)) {
                data = JSON.stringify(data)
              }
              if (!isString(data)) {
                data = data.toString()
              }
              // return {
              //   name: target.name,
              //   hash: crypto
              //     .createHash("sha256")
              //     .update(data, "utf8")
              //     .digest("hex"),
              //   data,
              // }
              return `${target.name}: ${data}`
            })
            .join(",")
          fs.writeFileSync(
            path.join(baseDir, "preset-data.js"),
            `
          const data = { ${result} }
          export default function getPresetData(key) {
            if (!key) return data
            return data[key]
          }
          `,
            "utf8"
          )
          cb()
        })
        .catch((err) => {
          console.error(err)
          cb()
        })
    })
  }
}
