import '@nomiclabs/hardhat-ethers'
import path from 'path'

import { extendConfig, extendEnvironment } from 'hardhat/config'
import { lazyFunction } from 'hardhat/plugins'
import { HardhatConfig, HardhatUserConfig, Network } from 'hardhat/types'

import { getWallet, getWallets } from './lib/wallet'
import { getSigner, getSigners } from './lib/signer'
import { getProvider } from './lib/provider'
import { logDebug } from './helpers/logger'

import './type-extensions'
import './tasks'

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  const userPath = userConfig.paths?.accounts

  let accounts: string
  if (userPath === undefined) {
    accounts = path.join(config.paths.root, '.keystore')
  } else {
    if (path.isAbsolute(userPath)) {
      accounts = userPath
    } else {
      accounts = path.normalize(path.join(config.paths.root, userPath))
    }
  }

  logDebug(`Using accounts directory: ${accounts}`)
  config.paths.accounts = accounts
})

extendEnvironment((hre) => {
  hre.accounts = {
    getWallet: lazyFunction(() => (name?: string, password?: string) =>
      getWallet(hre.config.paths.accounts, name, password),
    ),
    getWallets: lazyFunction(() => (name?: string, password?: string) =>
      getWallets(hre.config.paths.accounts, name, password),
    ),
    getSigner: lazyFunction(() => (network?: Network, name?: string, password?: string) =>
      getSigner(network ?? hre.network, hre.config.paths.accounts, name, password),
    ),
    getSigners: lazyFunction(() => (network?: Network, name?: string, password?: string) =>
      getSigners(network ?? hre.network, hre.config.paths.accounts, name, password),
    ),
    getProvider: lazyFunction(() => (network?: Network, name?: string, password?: string) =>
      getProvider(network ?? hre.network, hre.config.paths.accounts, name, password),
    ),
  }
})
