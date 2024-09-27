import fs from 'fs'
import path from 'path'

import { Wallet } from 'ethers'
import { logDebug } from '../helpers/logger'
import { SecureAccountsPluginError } from '../helpers/error'

import type { HDNodeWallet } from 'ethers'
import { getAccountOrAsk, getPasswordOrAsk } from '../helpers/ask'

export interface SecureAccount {
  name: string
  filename: string
  json: string
}

export function getSecureAccounts(accountsDir: string): SecureAccount[] {
  if (!fs.existsSync(accountsDir)) {
    return []
  }

  return fs.readdirSync(accountsDir).map((a) => ({
    name: path.parse(a).name,
    filename: path.join(accountsDir, a),
    json: fs.readFileSync(path.join(accountsDir, a), 'utf8'),
  }))
}

export function getSecureAccount(accountsDir: string, name: string): SecureAccount | undefined {
  const accounts = getSecureAccounts(accountsDir)
  return accounts.find((a) => a.name === name)
}

export function accountExists(accountsDir: string, name: string): boolean {
  return getSecureAccount(accountsDir, name) !== undefined
}

export async function encryptAccount(
  accountsDir: string,
  name: string,
  password: string,
  mnemonic: string,
): Promise<SecureAccount> {
  const wallet = mnemonic.length === 0 ? Wallet.createRandom() : Wallet.fromPhrase(mnemonic)
  const encrypted = await wallet.encrypt(password)

  if (!fs.existsSync(accountsDir)) {
    fs.mkdirSync(accountsDir)
    logDebug(`Created accounts directory: ${accountsDir}`)
  }

  const fileName = path.join(accountsDir, `${name}.json`)
  fs.writeFileSync(fileName, encrypted, 'utf8')
  logDebug(`Saved account to ${fileName}`)

  return {
    name: name,
    filename: fileName,
    json: encrypted,
  }
}

export async function decryptAccount(account: SecureAccount, password: string): Promise<string> {
  const wallet = await Wallet.fromEncryptedJson(account.json, password)
  logDebug(`Account unlocked: ${wallet.address}`)

  if (!isHDNodeWallet(wallet) || wallet.mnemonic === null) {
    throw new SecureAccountsPluginError('Decrypted account is not valid!')
  }

  return wallet.mnemonic.phrase
}

export async function unlockAccount(
  accountsDir: string,
  accountName?: string,
  accountPassword?: string,
): Promise<string> {
  const account = await getAccountOrAsk(accountName, accountsDir)
  const password = await getPasswordOrAsk(accountPassword)

  return await decryptAccount(account, password)
}

// typeguard
function isHDNodeWallet(wallet: Wallet | HDNodeWallet): wallet is HDNodeWallet {
  return (wallet as HDNodeWallet).mnemonic !== undefined
}
