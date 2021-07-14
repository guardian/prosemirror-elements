import baseConfig from './webpack.config.base.js';
import path from "path";

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

export default {
  ...baseConfig,
  devtool: "inline-source-map",
  entry: "./demo/index.ts",
  mode: "development",
  devServer: {
    contentBase: path.join(__dirname, "../demo"),
    compress: true,
    port: 7890,
    disableHostCheck: true,
  },
};
