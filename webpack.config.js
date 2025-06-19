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
  entry: "./demo/index.tsx",
  mode: "development",
  devServer: {
    static: {
      directory: path.resolve(dirName, "demo"),
    },
    compress: true,
    port: 7890,
    allowedHosts: "all",
    open: [ "https://prosemirror-elements.local.dev-gutools.co.uk" ]
  },
};
