import '@nomiclabs/hardhat-ethers'
import path from 'path'

import { extendConfig, extendEnvironment } from 'hardhat/config'
import { lazyFunction } from 'hardhat/plugins'
import { HardhatConfig, HardhatUserConfig } from 'hardhat/types'

import { getWallet, getWallets } from './lib/wallet'
import { getSigner, getSigners } from './lib/signer'
import { getProvider } from './lib/provider'
import { logDebug, logError } from './helpers/logger'

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
  if (process.stdout.isTTY) {
    logError('REPL environment not supported!')
  }

  hre.accounts = {
    getWallet: lazyFunction(() => (name?: string, password?: string) =>
      getWallet(hre.config.paths.accounts, name, password),
    ),
    getWallets: lazyFunction(() => (name?: string, password?: string) =>
      getWallets(hre.config.paths.accounts, name, password),
    ),
    getSigner: lazyFunction(() => (name?: string, password?: string) =>
      getSigner(hre.network, hre.config.paths.accounts, name, password),
    ),
    getSigners: lazyFunction(() => (name?: string, password?: string) =>
      getSigners(hre.network, hre.config.paths.accounts, name, password),
    ),
    getProvider: lazyFunction((name?: string, password?: string) => () =>
      getProvider(hre.network, hre.config.paths.accounts, name, password),
    ),
  }
})
