/* eslint-disable -- this configuration will not typecheck without lots of exclusions! */
import webpackPreprocessor from "@cypress/webpack-batteries-included-preprocessor";
import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on) {
      on(
        "file:preprocessor",
        webpackPreprocessor({ typescript: "typescript" })
      );
    },
    specPattern: "cypress/tests/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:7890",
  },
});
