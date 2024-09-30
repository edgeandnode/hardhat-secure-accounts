import 'hardhat/types/config'
import 'hardhat/types/runtime'

import type { HDNodeWallet } from 'ethers'
import type { HardhatEthersProvider } from '@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider'

interface SecureAccountsOptions {
  enabled?: boolean
  defaultAccount?: string
  defaultAccountPassword?: string
}

declare module 'hardhat/types/config' {
  interface ProjectPathsConfig {
    secureAccounts: string
  }

  interface ProjectPathsUserConfig {
    secureAccounts?: string
  }

  interface HardhatConfig {
    secureAccounts?: SecureAccountsOptions
  }

  interface HardhatUserConfig {
    secureAccounts?: SecureAccountsOptions
  }

  interface HardhatNetworkUserConfig {
    secureAccounts?: SecureAccountsOptions
  }

  interface HardhatNetworkConfig {
    secureAccounts?: SecureAccountsOptions
  }

  interface HttpNetworkUserConfig {
    secureAccounts?: SecureAccountsOptions
  }

  interface HttpNetworkConfig {
    secureAccounts?: SecureAccountsOptions
  }
}

interface SecureAccountsRuntimeEnvironment {
  provider: HardhatEthersProvider
  getSigner(name?: string, password?: string): Promise<HDNodeWallet>
  getSigners(name?: string, password?: string): Promise<HDNodeWallet[]>
}

declare module 'hardhat/types/runtime' {
  interface HardhatRuntimeEnvironment {
    accounts: SecureAccountsRuntimeEnvironment
  }
}
