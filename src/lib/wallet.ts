import { Wallet } from 'ethers'
import { derivePrivateKeys } from 'hardhat/internal/core/providers/util'

import { SecureAccountPluginError } from '../helpers/error'
import { logDebug } from '../helpers/logger'
import { getAccountOrAsk, getPasswordOrAsk } from './ask'

export const DEFAULT_HD_INITIAL_INDEX = 0
export const DEFAULT_HD_COUNT = 20
export const DEFAULT_HD_PASSPHRASE = ''

export async function getWallet(
  accountsDir: string,
  name?: string,
  _password?: string,
): Promise<Wallet> {
  const account = await getAccountOrAsk(name, accountsDir)
  const password = await getPasswordOrAsk(_password)

  try {
    const wallet = await Wallet.fromEncryptedJson(account.json, password)
    logDebug(`Account unlocked: ${wallet.address}`)

    return wallet
  } catch (error) {
    throw new SecureAccountPluginError(error as Error)
  }
}

export async function getWallets(
  accountsDir: string,
  name?: string,
  password?: string,
): Promise<Wallet[]> {
  const wallet = await getWallet(accountsDir, name, password)

  logDebug(`Deriving private keys from mnemonic`)
  const privateKeys = derivePrivateKeys(
    wallet.mnemonic.phrase,
    removeIndexFromHDPath(wallet.mnemonic.path),
    DEFAULT_HD_INITIAL_INDEX,
    DEFAULT_HD_COUNT,
    DEFAULT_HD_PASSPHRASE,
  )

  return privateKeys.map((privateKey) => new Wallet(privateKey))
}


export function removeIndexFromHDPath (hdpath: string): string {
  if (hdpath.endsWith('/')) {
    return hdpath
  } else {
    return hdpath.substring(0, hdpath.lastIndexOf('/') + 1)
  }
}
