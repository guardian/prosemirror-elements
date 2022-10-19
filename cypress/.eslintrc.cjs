module.exports = {
  extends: "../.eslintrc.cjs",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: ["**/*.js", "cypress.config.ts"],
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
