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
      accounts: [accPrivatekey],
      // acc of above private key => 0x99108131C65474a526D441531707CaDbD3cB2D9f
      gasPrice: 3000000000,
    },

  },
  defaultNetwork: 'hardhat',
};
