import cloneDeep from 'lodash.clonedeep'
import { EthersProviderWrapper } from '@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper'
import { Mnemonic } from 'ethers/lib/utils'
import { createProvider } from 'hardhat/internal/core/providers/construction'
import {
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

export async function getProvider(
  _network: Network,
  accountsDir: string,
  name?: string,
  password?: string,
): Promise<EthersProviderWrapper> {
  const wallet = await getWallet(accountsDir, name, password)
  const network = setNetworkMnemonic(_network, wallet.mnemonic)
  return createProviderWrapper(network)
}

function createProviderWrapper(network: Network) {
  const ethereumProvider = createProvider(network.name, network.config)
  return new EthersProviderWrapper(ethereumProvider)
}

function setNetworkMnemonic(_network: Network, mnemonic: Mnemonic): Network {
  logDebug(`Cloning network config for ${_network.name} provider`)
  const network = cloneDeep(_network)

  logDebug(`Injecting mnemonic into network config for ${network.name}`)
  let networkAccounts = network.config.accounts

  if (
    isHardhatNetworkHDAccountsConfig(networkAccounts) ||
    isHttpNetworkHDAccountsConfig(networkAccounts)
  ) {
    logDebug('Target network already uses HD accounts, overriding mnemonic')
    networkAccounts.mnemonic = mnemonic.phrase
    networkAccounts.path = removeIndexFromHDPath(mnemonic.path)
  } else {
    logDebug('Target network not using HD accounts, setting mnemonic')
    network.config.accounts = {
      mnemonic: mnemonic.phrase,
      initialIndex: DEFAULT_HD_INITIAL_INDEX,
      count: DEFAULT_HD_COUNT,
      path: removeIndexFromHDPath(mnemonic.path),
      passphrase: DEFAULT_HD_PASSPHRASE,
    }
  }
  return network
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
