const fs = require('fs');
const path = require('path');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost
      port: 7545,            // Standard Ethereum port
      network_id: "5777",    // Any network
    }
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.13",      // Fetch exact version from solc-bin
    }
  },

  plugins: ["truffle-plugin-exec"]
};
