import { HardhatUserConfig } from 'hardhat/types'

import '../../../src/index'

import { HARDHAT_MNEMONIC, TEST_NAME, TEST_PASSWORD } from '../../mnemonics'

const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    secureAccounts: '.accounts',
  },
  networks: {
    hardhat: {
      secureAccounts: {
        enabled: true,
        defaultAccount: TEST_NAME,
        defaultAccountPassword: TEST_PASSWORD
      },
      accounts: {
        mnemonic: HARDHAT_MNEMONIC,
      }
    },
  },
}

export default config
