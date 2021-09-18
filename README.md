# @lsky/preset-data

> 在编译期，在项目中，预设数据。

## 使用方法

### 安装

```shell
$ yarn add @lsky/preset-data
```

### 添加 `loader`

> 在`babel-loader`处增加`PresetDataLoader`

```javascript
{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: [
    "babel-loader",
    {
      loader: "@lsky/preset-data/loader",
    },
  ],
},
```

### 添加 `plugin`

```javascript
const PresetDataPlugin = require("@lsky/preset-data/plugin")
plugins: [
  new PresetDataPlugin([
    {
      name: "jobs", // 必须参数
      // -------
      // fetch 请求参数请参照 axios 配置
      url: "http://localhost:8030/test",  // required
      method: "get",
      //-------
      cb: (data) => {
        // axios response data
        // must return data
        return data.data
      },
    },
  ]),
  new HtmlWebPackPlugin({
    template: path.resolve(__dirname, "../index.ejs"),
    filename: path.resolve(__dirname, "../dist/index.html"),
  }),
],
```

#### `PresetDataPlugin` 使用说明

```typescript
interface Option extends axios.AxiosRequestConfig {
  name: string;
  cb?: (responseData: any) => data:any;
}
new PresetDataPlugin(options: (Option | Option[]))
```

| Name | Type     | Default | Description                                      |
| :--- | :------- | :------ | :----------------------------------------------- |
| name | string   | null    | 预设数据名称，用于项目中取值。注意，该字段必填。 |
| cb   | function | null    | 处理数据                                         |

### 项目中使用预设数据

```javascript
import presetDataFunc from "@lsky/preset-data"

console.log(presetDataFunc("jobs")) // 参数是 plugin 的 name
console.log(presetDataFunc())
```
