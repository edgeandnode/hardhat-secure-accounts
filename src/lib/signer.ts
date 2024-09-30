import { HDNodeWallet, Mnemonic } from 'ethers'
import { unlockAccount } from './account'

import type { EthereumProvider } from 'hardhat/types'
import type { HardhatEthersProvider } from '@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider'

export const DEFAULT_HD_COUNT = 20
export const DEFAULT_HD_PATH_PREFIX = `m/44'/60'/0'/0/`

export async function getSigner(
  accountsDir: string,
  provider: HardhatEthersProvider,
  accountName?: string,
  accountPassword?: string,
): Promise<HDNodeWallet> {
  const phrase = await unlockAccount(accountsDir, accountName, accountPassword)
  return deriveWallets(phrase, 1)[0].connect(provider)
}

export async function getSigners(
  accountsDir: string,
  provider: HardhatEthersProvider,
  accountName?: string,
  accountPassword?: string,
): Promise<HDNodeWallet[]> {
  const phrase = await unlockAccount(accountsDir, accountName, accountPassword)
  return deriveWallets(phrase, DEFAULT_HD_COUNT).map(w => w.connect(provider))
}

function deriveWallets(phrase: string, count: number): HDNodeWallet[] {
  const mnemonic = Mnemonic.fromPhrase(phrase)
  return Array.from(Array(count).keys()).map((i) =>
    HDNodeWallet.fromMnemonic(mnemonic, `${DEFAULT_HD_PATH_PREFIX}${i}`),
  )
}
