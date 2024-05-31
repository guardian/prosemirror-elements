module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: ["@guardian/eslint-config-typescript"],
      rules: {
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "import/no-cycle": "error",
        "@typescript-eslint/strict-boolean-expressions": [
          'error',
          {
            // This rule also errors on any ambiguous type comparisons (e.g !! on a type `null | undefined | ""`)
            // https://typescript-eslint.io/rules/strict-boolean-expressions/
            allowString: true,
            allowNumber: true,
            allowNullableObject: true,
            allowNullableBoolean: true,
            allowNullableString: true,
            allowNullableNumber: false, // We only want to enforce this for numbers
            allowAny: true,
          },
        ],
      },
    },
  ],
};
