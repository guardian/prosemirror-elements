import path from "path";

const moduleURL = new URL(import.meta.url);
export const dirName = path.dirname(moduleURL.pathname);

export default {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".cy.ts", ".js"],
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
