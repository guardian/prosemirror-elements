import baseConfig, { dirName } from './webpack.config.base.js';
import path from "path";

export default {
  ...baseConfig,
  devtool: "inline-source-map",
  entry: "./demo/index.ts",
  mode: "development",
  devServer: {
    contentBase: path.join(dirName, "../src/demo"),
    compress: true,
    port: 7890,
    disableHostCheck: true,
  },
};
