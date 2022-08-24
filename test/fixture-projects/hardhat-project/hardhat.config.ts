import { HardhatUserConfig } from 'hardhat/types'

import '../../../src/index'

import { HARDHAT_MNEMONIC } from '../../mnemonics'

const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    accounts: '.accounts',
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: HARDHAT_MNEMONIC,
      }
    }
  }
}

export default config
