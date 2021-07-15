module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  overrides: [
    {
      files: ["src/**/*.{ts,tsx}", "demo/**/*.{ts,tsx}"],
      extends: ["@guardian/eslint-config-typescript"],
      rules: {
        "@typescript-eslint/unbound-method": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
        "@typescript-eslint/no-unused-vars": 2
      },
    },
  ],
};
