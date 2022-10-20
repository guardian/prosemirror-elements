const crypto = require("crypto");

// Crypto is not provided by JSDOM, so we polyfill it here.
window.crypto = {
  randomUUID: crypto.randomUUID,
};
