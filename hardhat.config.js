require('@nomiclabs/hardhat-waffle');
require('dotenv').config();

module.exports = {
  solidity: '0.8.1',
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/6b4ebc96f79147bda39105fb2256e884",
      accounts: ['9234090e56ded81d98806c81a9f76be18d701bb8da56e5226fff8f630f2061a2'],
    },
  },
  mainnet: {
    chainId: 1,
    url: process.env.PROD_QUICKNODE_KEY,
    accounts: [process.env.PRIVATE_KEY],
  },
};
