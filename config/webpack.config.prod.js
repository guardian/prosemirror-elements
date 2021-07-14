import nodeExternals from "webpack-node-externals";
import baseConfig from "./webpack.config.base.js";
import path from "path";

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

const coreProdConfig = {
  ...baseConfig,
  entry: "./src/index.ts",
  mode: "production",
  externals: [nodeExternals()],
};

const commonJsConfig = {
  ...coreProdConfig,
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "../dist"),
    library: {
      type: "commonjs2",
    },
  },
};

const moduleConfig = {
  ...coreProdConfig,
  output: {
    filename: "index.mjs",
    path: path.resolve(__dirname, "../dist"),
    library: {
      type: "module",
    },
  },
  experiments: {
    outputModule: true
  }
};

export default [commonJsConfig, moduleConfig];
