import { HDNodeWallet, Wallet } from 'ethers'
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
): Promise<HDNodeWallet> {
  const account = await getAccountOrAsk(name, accountsDir)
  const password = await getPasswordOrAsk(_password)

  try {
    const wallet = await Wallet.fromEncryptedJson(account.json, password)
    logDebug(`Account unlocked: ${wallet.address}`)

    if (isHDNodeWallet(wallet)) {
      return wallet
    } else {
      throw new SecureAccountPluginError('Wallet is not an HDNodeWallet')
    }
  } catch (error) {
    throw new SecureAccountPluginError(error as Error)
  }
}

export async function getWallets(
  accountsDir: string,
  name?: string,
  password?: string,
): Promise<HDNodeWallet[]> {
  const wallet = await getWallet(accountsDir, name, password)

  if (wallet.mnemonic === null) {
    throw new SecureAccountPluginError('Wallet is not an HDNodeWallet')
  }

  logDebug(`Deriving private keys from mnemonic`)
  return Array.from(Array(DEFAULT_HD_COUNT).keys()).map((i) => wallet.deriveChild(i))
}

export function removeIndexFromHDPath(hdpath: string): string {
  if (hdpath.endsWith('/')) {
    return hdpath
  } else {
    return hdpath.substring(0, hdpath.lastIndexOf('/') + 1)
  }
}

function isHDNodeWallet(wallet: Wallet | HDNodeWallet): wallet is HDNodeWallet {
  return (wallet as HDNodeWallet).mnemonic !== undefined
}
