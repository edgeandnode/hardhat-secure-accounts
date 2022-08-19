// We load the plugin here.
import { HardhatUserConfig } from 'hardhat/types'

import '../../../src/index'

const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    accounts: '.accounts',
  },
  networks: {
    locale: {
      url: 'http://localhost:8545',
      accounts: {
        // mnemonic: 'myth like bonus scare over problem client lizard pioneer submit female collect',
        mnemonic: 'rival decrease airport you road cage surround indicate seven violin mean muscle',
      }
    }
  }
}

export default config
