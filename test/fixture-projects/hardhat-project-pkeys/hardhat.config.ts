import { HardhatUserConfig } from 'hardhat/types'

import '../../../src/index'

import { HARDHAT_PRIVATE_KEYS } from '../../mnemonics'

const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    accounts: '.accounts',
  },
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: HARDHAT_PRIVATE_KEYS[0],
          balance: '100000000000',
        },
        {
          privateKey: HARDHAT_PRIVATE_KEYS[1],
          balance: '100000000000',
        },
        {
          privateKey: HARDHAT_PRIVATE_KEYS[2],
          balance: '100000000000',
        },
      ],
    },
  },
}

export default config
