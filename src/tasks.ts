import fs from 'fs'
import path from 'path'

import { task, subtask } from 'hardhat/config'

import { getSecureAccounts } from './lib/account'
import { logDebug } from './helpers/logger'
import { askForConfirmation, getAccountOrAsk, getPasswordOrAsk, getStringOrAsk } from './lib/ask'
import { SecureAccountPluginError } from './helpers/error'

export const TASK_ACCOUNTS = 'accounts'
export const TASK_ACCOUNTS_ADD = 'accounts:add'
export const TASK_ACCOUNTS_REMOVE = 'accounts:remove'
export const TASK_ACCOUNTS_LIST = 'accounts:list'
export const TASK_ACCOUNTS_UNLOCK_SIGNER = 'accounts:unlock'
export const TASK_ACCOUNTS_UNLOCK_SIGNERS = 'accounts:unlock:signers'
export const TASK_ACCOUNTS_UNLOCK_WALLET = 'accounts:unlock:wallet'
export const TASK_ACCOUNTS_UNLOCK_WALLETS = 'accounts:unlock:wallets'
export const TASK_ACCOUNTS_UNLOCK_PROVIDER = 'accounts:unlock:provider'

task(TASK_ACCOUNTS, 'Manage local accounts')
  .addOptionalPositionalParam('action', 'Action to perform: list, add, remove')
  .addOptionalParam('name', 'Name of the account')
  .addOptionalParam('password', 'Password to encrypt the account')
  .setAction(async (taskArgs, hre) => {
    const action = taskArgs.action ? `accounts:${taskArgs.action}` : TASK_ACCOUNTS_LIST

    try {
      logDebug(`Running action ${action}`)
      await hre.run(action, taskArgs)
    } catch (error) {
      throw new SecureAccountPluginError('Action not supported. Run `npx hardhat accounts --help` for more info')
    }
  })

subtask(TASK_ACCOUNTS_ADD, 'Add a new account via mnemonic.')
  .addOptionalParam('name', 'Name of the account')
  .addOptionalParam('mnemonic', 'Mnemonic to derive the account from')
  .addOptionalParam('password', 'Password used to encrypt the account')
  .setAction(async (taskArgs, hre) => {
    // Get account name
    const accounts = getSecureAccounts(hre.config.paths.accounts)
    const name = await getStringOrAsk('name', 'Enter account name', taskArgs.name)
    logDebug(`Account name: ${name}`)

    const fileName = path.join(hre.config.paths.accounts, `${name}.json`)

    if (accounts.map((a) => a.name).includes(name)) {
      throw new SecureAccountPluginError(`Account with name ${name} already exists!`)
    }

    // Get account mnemonic
    const mnemonic = await getStringOrAsk('mnemonic', 'Enter mnemonic (leave empty to create a random mnemonic)', taskArgs.mnemonic)
    const wallet = mnemonic.length === 0 ? hre.ethers.Wallet.createRandom() : hre.ethers.Wallet.fromMnemonic(mnemonic)

    // Get account password and ecrypt wallet
    const password = await getPasswordOrAsk(taskArgs.password)
    const encrypted = await wallet.encrypt(password)

    // Ensure accounts dir exists
    if (!fs.existsSync(hre.config.paths.accounts)) {
      fs.mkdirSync(hre.config.paths.accounts)
      logDebug(`Created accounts directory: ${hre.config.paths.accounts}`)
    }

    // Write encrypted account to file
    fs.writeFileSync(fileName, encrypted, 'utf8')
    console.log(`Saved account to ${fileName}`)
  })

subtask(TASK_ACCOUNTS_REMOVE, 'Remove an existing account').setAction(async (taskArgs, hre) => {
  const account = await getAccountOrAsk(taskArgs.name, hre.config.paths.accounts)
  logDebug(`Attempting to delete ${account.name}...`)

 const deleteAccount = await askForConfirmation(`Are you sure you want to delete ${account.name}?`)

 if (deleteAccount) {
    fs.unlinkSync(account.filename)
    console.log(`Deleted account ${account.name} from ${account.filename}`)
 }
})

subtask(TASK_ACCOUNTS_LIST, 'List local accounts').setAction(async (_, hre) => {
  const accounts = getSecureAccounts(hre.config.paths.accounts)

  console.log('Managed accounts:')
  for (const account of accounts) {
    console.log(`> ${account.name} - 0x${JSON.parse(account.json).address}`)
  }
})

subtask(TASK_ACCOUNTS_UNLOCK_SIGNER, 'Unlock account, returns a single signer').setAction(async (taskArgs, hre) => {
  const signer = await hre.accounts.getSigner(hre.network, taskArgs.name, taskArgs.password)
  logDebug(`Account ${signer.address} unlocked!`)
  return signer
})

subtask(TASK_ACCOUNTS_UNLOCK_SIGNERS, 'Unlock account, returns multiple signers').setAction(async (taskArgs, hre) => {
  const signers = await hre.accounts.getSigners(hre.network, taskArgs.name, taskArgs.password)
  logDebug(`Account unlocked, returning ${signers.length} signers!`)
  return signers
})

subtask(TASK_ACCOUNTS_UNLOCK_WALLET, 'Unlock account, returns a single wallet').setAction(async (taskArgs, hre) => {
  const wallet = await hre.accounts.getWallet(taskArgs.name, taskArgs.password)
  logDebug(`Account ${wallet.address} unlocked!`)
  return wallet
})

subtask(TASK_ACCOUNTS_UNLOCK_WALLETS, 'Unlock account, returns multiple wallets').setAction(async (taskArgs, hre) => {
  const wallets = await hre.accounts.getWallets(taskArgs.name, taskArgs.password)
  logDebug(`Account unlocked, returning ${wallets.length} wallets!`)
  return wallets
})

subtask(TASK_ACCOUNTS_UNLOCK_PROVIDER, 'Unlock account, returns a provider').setAction(async (taskArgs, hre) => {
  const provider = await hre.accounts.getProvider(hre.network, taskArgs.name, taskArgs.password)
  logDebug(`Account unlocked, returning provider!`)
  return provider
})
