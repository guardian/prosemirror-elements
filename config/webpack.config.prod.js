import nodeExternals from "webpack-node-externals";
import baseConfig, { dirName } from "./webpack.config.base.js";
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
    path: path.resolve(dirName, "../dist/cjs"),
    library: {
      type: "commonjs2",
    },
  },
};

export default commonJsConfig;
