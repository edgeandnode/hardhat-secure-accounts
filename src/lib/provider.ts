import { HDWalletProvider } from 'hardhat/internal/core/providers/accounts'
import { unlockAccount } from './account'

import type { EIP1193Provider } from 'hardhat/types'

export class SecureAccountsProvider extends HDWalletProvider {
  constructor(provider: EIP1193Provider, mnemonic: string) {
    super(provider, mnemonic)
  }

  static async create(
    provider: EIP1193Provider,
    accountsDir: string,
    accountName?: string,
    accountPassword?: string,
  ): Promise<SecureAccountsProvider> {
    const phrase = await unlockAccount(accountsDir, accountName, accountPassword)
    return new SecureAccountsProvider(provider, phrase)
  }
}
