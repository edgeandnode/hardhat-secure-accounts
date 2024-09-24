import cloneDeep from 'lodash.clonedeep'
import { EthersProviderWrapper } from '@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper'
import { createProvider } from 'hardhat/internal/core/providers/construction'
import {
  HardhatConfig,
  HardhatNetworkAccountsConfig,
  HardhatNetworkHDAccountsConfig,
  HttpNetworkAccountsConfig,
  HttpNetworkHDAccountsConfig,
  Network,
} from 'hardhat/types'
import {
  DEFAULT_HD_COUNT,
  DEFAULT_HD_INITIAL_INDEX,
  DEFAULT_HD_PASSPHRASE,
  removeIndexFromHDPath,
} from './wallet'

import { logDebug } from '../helpers/logger'
import { getWallet } from './wallet'
import { Mnemonic } from 'ethers'

export async function getProvider(
  config: HardhatConfig,
  _network: Network,
  accountsDir: string,
  name?: string,
  password?: string,
): Promise<EthersProviderWrapper> {
  const wallet = await getWallet(accountsDir, name, password)
  if (wallet.mnemonic === null || wallet.path === null) {
    throw new Error('Wallet is not an HDNodeWallet')
  }
  const network = setNetworkMnemonic(_network, wallet.mnemonic, wallet.path)
  return createProviderWrapper(config, network)
}

async function createProviderWrapper(config: HardhatConfig, network: Network) {
  const ethereumProvider = await createProvider(config, network.name)
  return new EthersProviderWrapper(ethereumProvider)
}

function setNetworkMnemonic(_network: Network, mnemonic: Mnemonic, path: string): Network {
  logDebug(`Cloning network config for ${_network.name} provider`)
  const networkConfig = cloneDeep(_network.config)

  logDebug(`Injecting mnemonic into network config for ${_network.name}`)
  let networkAccounts = networkConfig.accounts

  if (
    isHardhatNetworkHDAccountsConfig(networkAccounts) ||
    isHttpNetworkHDAccountsConfig(networkAccounts)
  ) {
    logDebug('Target network already uses HD accounts, overriding mnemonic')
    networkAccounts.mnemonic = mnemonic.phrase
    // networkAccounts.path = removeIndexFromHDPath(mnemonic.path)
  } else {
    logDebug('Target network not using HD accounts, setting mnemonic')
    networkConfig.accounts = {
      mnemonic: mnemonic.phrase,
      initialIndex: DEFAULT_HD_INITIAL_INDEX,
      count: DEFAULT_HD_COUNT,
      path: removeIndexFromHDPath(path),
      passphrase: mnemonic.password || DEFAULT_HD_PASSPHRASE,
    }
  }

  _network.config = networkConfig
  return _network
}

// Type guards
function isHardhatNetworkHDAccountsConfig(
  accountsConfig: HardhatNetworkAccountsConfig | HttpNetworkAccountsConfig,
): accountsConfig is HardhatNetworkHDAccountsConfig {
  return (accountsConfig as HardhatNetworkHDAccountsConfig).mnemonic !== undefined
}

function isHttpNetworkHDAccountsConfig(
  accountsConfig: HardhatNetworkAccountsConfig | HttpNetworkAccountsConfig,
): accountsConfig is HttpNetworkHDAccountsConfig {
  return (accountsConfig as HttpNetworkHDAccountsConfig).mnemonic !== undefined
}
