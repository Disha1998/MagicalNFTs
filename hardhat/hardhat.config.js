require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

var accPrivatekey = process.env.accountprivetkeyZora;

require('dotenv').config();
module.exports = {
  solidity: {
    version: '0.8.1',
  },
  networks: {
    // for testnet
    'zora-sepolia': {
      url: 'https://testnet.rpc.zora.energy/',
      accounts: ['c6a24ce0e9c5caedef0f6ae7bbeebc36c389f72384cb0ffa36a35dde9b04c9a6'],
      // acc of above private key => 0x99108131C65474a526D441531707CaDbD3cB2D9f
      gasPrice: 3000000000,
    },
    // for testnet
    'base-goerli': {
      url: 'https://goerli.base.org',
      accounts: ['c6a24ce0e9c5caedef0f6ae7bbeebc36c389f72384cb0ffa36a35dde9b04c9a6'],
      gasPrice: 1000000000,
    },

  },
  defaultNetwork: 'hardhat',
};
