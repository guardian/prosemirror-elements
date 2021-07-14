import nodeExternals from 'webpack-node-externals';
import baseConfig from './webpack.config.base.js';
import path from "path";

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

export default {
    ...baseConfig,
    entry: "./src/index.ts",
    mode: "production",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../dist"),
        library: {
            type: 'commonjs2',
        },
    },
    externals: [nodeExternals()]
};