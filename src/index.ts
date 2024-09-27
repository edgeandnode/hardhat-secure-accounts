import '@nomicfoundation/hardhat-ethers'
import path from 'path'

import { extendConfig, extendEnvironment, extendProvider } from 'hardhat/config'
import { lazyObject } from 'hardhat/plugins'
import { getSigner, getSigners } from './lib/signer'
import { logDebug } from './helpers/logger'

import type { HardhatConfig, HardhatUserConfig } from 'hardhat/types'
import type { SecureAccountsProvider as SecureAccountsProviderT } from './lib/provider'

import './type-extensions'
import './tasks'

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  const userPath = userConfig.paths?.secureAccounts

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
  config.paths.secureAccounts = accounts
})

extendEnvironment((hre) => {
  hre.accounts = lazyObject(() => {
    const { SecureAccountsProvider } = require('./lib/provider') as {
      SecureAccountsProvider: typeof SecureAccountsProviderT
    }
    const defaultAccount = hre.config.networks[hre.network.name].secureAccounts?.defaultAccount
    const defaultAccountPassword = hre.config.networks[hre.network.name].secureAccounts?.defaultAccountPassword

    return {
      provider: () =>
        SecureAccountsProvider.create(
          hre.network.provider,
          hre.config.paths.secureAccounts,
          defaultAccount,
          defaultAccountPassword
        ),
      getSigner: (accountName?: string, accountPassword?: string) =>
        getSigner(hre.config.paths.secureAccounts, accountName, accountPassword),
      getSigners: (accountName?: string, accountPassword?: string) =>
        getSigners(hre.config.paths.secureAccounts, accountName, accountPassword),
    }
  })
})

extendProvider(async (provider, config, network) => {
  if (config.networks[network].secureAccounts) {
    const { SecureAccountsProvider } = require('./lib/provider') as {
      SecureAccountsProvider: typeof SecureAccountsProviderT
    }
    const defaultAccount = config.networks[network].secureAccounts?.defaultAccount
    const defaultAccountPassword = config.networks[network].secureAccounts?.defaultAccountPassword

    return await SecureAccountsProvider.create(
      provider,
      config.paths.secureAccounts,
      defaultAccount,
      defaultAccountPassword
    )
  }

  return provider
})
