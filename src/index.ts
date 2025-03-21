import '@nomicfoundation/hardhat-ethers'
import path from 'path'

import { extendConfig, extendEnvironment, extendProvider } from 'hardhat/config'
import { lazyObject } from 'hardhat/plugins'
import { getSigner, getSigners } from './lib/signer'
import { logDebug } from './helpers/logger'

import type { HardhatEthersProvider as HardhatEthersProviderT } from '@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider'
import type { SecureAccountsProvider as SecureAccountsProviderT } from './lib/provider'
import type { HardhatConfig, HardhatUserConfig } from 'hardhat/types'

import './type-extensions'
import './tasks'
import { getSecureAccounts } from './lib/account'

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
    const {
      HardhatEthersProvider,
    } = require('@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider') as {
      HardhatEthersProvider: typeof HardhatEthersProviderT
    }

    const provider = new HardhatEthersProvider(hre.network.provider, hre.network.name)

    return {
      provider: provider,
      getSigner: (accountName?: string, accountPassword?: string) =>
        getSigner(hre.config.paths.secureAccounts, provider, accountName, accountPassword),
      getSigners: (accountName?: string, accountPassword?: string) =>
        getSigners(hre.config.paths.secureAccounts, provider, accountName, accountPassword),
    }
  })
})

extendProvider(async (provider, config, network) => {
  if (
    (config.networks[network].secureAccounts?.enabled ||
    config.secureAccounts?.enabled) &&
    process.env.SECURE_ACCOUNTS_DISABLE_PROVIDER !== 'true'
  ) {
    const secureAccounts = getSecureAccounts(config.paths.secureAccounts)

    if (secureAccounts.length !== 0) {
      logDebug('Creating SecureAccounts provider')
      const { SecureAccountsProvider } = require('./lib/provider') as {
        SecureAccountsProvider: typeof SecureAccountsProviderT
      }
      const defaultAccount = config.networks[network].secureAccounts?.defaultAccount
      const defaultAccountPassword = config.networks[network].secureAccounts?.defaultAccountPassword

      return await SecureAccountsProvider.create(
        provider,
        config.paths.secureAccounts,
        defaultAccount,
        defaultAccountPassword,
      )
    } else {
      logDebug('No accounts found, using default provider')
    }
  }

  return provider
})
