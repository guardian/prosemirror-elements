import path from "path";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";

const moduleURL = new URL(import.meta.url);
export const dirName = path.dirname(moduleURL.pathname);

export default {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015'
        },
        exclude: /node_modules/
      },
    ],
  },
  plugins: [new ForkTsCheckerPlugin()],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(dirName, "dist"),
  },
  devtool: "inline-source-map",
  entry: "./demo/index.ts",
  mode: "development",
  devServer: {
    contentBase: path.join(dirName, "./demo"),
    compress: true,
    port: 7890,
    disableHostCheck: true,
  },
};
