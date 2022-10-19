import { defineConfig } from 'cypress'
import webpackPreprocessor from '@cypress/webpack-preprocessor';
import webpackOptions from "./webpack.config.js";
console.log(webpackOptions)
export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      on('file:preprocessor', webpackPreprocessor(webpackOptions))
    },
    specPattern: 'cypress/tests/**/*.cy.{js,jsx,ts,tsx}',
    baseUrl: 'http://localhost:7890',
  },
})
