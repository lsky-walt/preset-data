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
  const completion = (item) => {
    if (!item.cb) {
      item.cb = (data) => {
        return data
      }
    }
    return item
  }
  if (isArray(options)) return options.map(completion)
  if (isObject(options)) return [options].map(completion)
  return []
}

const handleRequest = (options) => {
  function optionsMap(item = {}) {
    const { cb, raw, ...opts } = item
    // 如果存在 raw 则优先使用 raw
    if (raw) {
      console.log(`Preset data from local ${chalk.green("raw")} attr.`)
      return Promise.resolve(raw)
    }
    console.log(`Preset data from ${chalk.green(opts.url)}.`)
    return axios(opts)
  }
  return Promise.all(handleOptions(options).map(optionsMap))
}

const checkOptions = (options) => {
  if (!options) return false
  let flag = false
  if (isArray(options)) {
    flag = !!options.find((item) => !item.name)
  }
  if (isObject(options)) {
    flag = !options.name
  }
  return flag
}

const addIgnore = (root) => {
  const ignorePath = path.join(root, "./.gitignore")
  if (fs.existsSync(ignorePath)) {
    const str = fs.readFileSync(ignorePath, "utf8")
    if (str.indexOf("preset-data.js") !== -1) {
      return
    }
    fs.writeFileSync(
      ignorePath,
      `${str}
preset-data.js
`,
      "utf8"
    )
    return
  }
  fs.writeFileSync(ignorePath, `preset-data.js`, "utf8")
}

module.exports = class PresetDataPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync("presetData", (compilation, cb) => {
      // if name
      if (checkOptions(this.options)) {
        console.log(`PresetDataPlugin: ${chalk.red("缺少必要参数 {name}")}.`)
        throw new Error("PresetDataPlugin: 缺少必要参数 {name}.")
      }

      // 需要在 .gitignore 里添加忽略文件
      addIgnore(compilation.context)

      const startTime = +new Date()
      baseDir = handleEntry(compilation.options.entry)

      handleRequest(this.options)
        .then((ds) => {
          let rawOptions = handleOptions(this.options)

          const result = ds
            .map((d, index) => {
              const target = rawOptions[index]
              let data = target.cb(d.data)
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
          console.log(
            `Preset data time: ${chalk.green(+new Date() - startTime)} ms`
          )
          cb()
        })
        .catch((err) => {
          throw err
        })
    })
  }
}
