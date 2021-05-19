module.exports = {
  extends: "../.eslintrc.js",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: ["**/*.js"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: ["@guardian/eslint-config-typescript"],
      rules: {
        "@typescript-eslint/unbound-method": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
      },
    },
  ],
};
