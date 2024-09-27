import fs from 'fs'

import { task, subtask } from 'hardhat/config'

import { accountExists, encryptAccount, getSecureAccounts } from './lib/account'
import {
  askForConfirmation,
  getAccountOrAsk,
  getPasswordOrAsk,
  getStringOrAsk,
} from './helpers/ask'
import { logDebug } from './helpers/logger'
import { SecureAccountsPluginError } from './helpers/error'

export const TASK_ACCOUNTS = 'accounts'
export const TASK_ACCOUNTS_ADD = 'accounts:add'
export const TASK_ACCOUNTS_REMOVE = 'accounts:remove'
export const TASK_ACCOUNTS_LIST = 'accounts:list'
export const ACCOUNTS_TASKS = [TASK_ACCOUNTS_ADD, TASK_ACCOUNTS_REMOVE, TASK_ACCOUNTS_LIST]

task('tt')
.setAction(async (_, hre) => {
  console.log(await hre.network.provider.send('eth_accounts'))
})

task(TASK_ACCOUNTS, 'Manage local accounts')
  .addOptionalPositionalParam('action', 'Action to perform: list, add, remove')
  .addOptionalParam('name', 'Name of the account')
  .addOptionalParam('password', 'Password to encrypt the account')
  .setAction(async (taskArgs, hre) => {
    const action = taskArgs.action ? `accounts:${taskArgs.action}` : TASK_ACCOUNTS_LIST

    if (!ACCOUNTS_TASKS.includes(action)) {
      throw new SecureAccountsPluginError(
        'Action not supported. Run `npx hardhat accounts --help` for more info',
      )
    }

    logDebug(`Running action ${action}`)
    await hre.run(action, taskArgs)
  })

subtask(TASK_ACCOUNTS_LIST, 'List local accounts').setAction(async (_, hre) => {
  const accounts = getSecureAccounts(hre.config.paths.secureAccounts)

  console.log('Managed accounts:')
  for (const account of accounts) {
    console.log(`> ${account.name} - 0x${JSON.parse(account.json).address}`)
  }
})

subtask(TASK_ACCOUNTS_ADD, 'Add a new account via mnemonic.')
  .addOptionalParam('name', 'Name of the account')
  .addOptionalParam('mnemonic', 'Mnemonic to derive the account from')
  .addOptionalParam('password', 'Password used to encrypt the account')
  .setAction(async (taskArgs, hre) => {
    const name = await getStringOrAsk('name', 'Enter account name', taskArgs.name)
    logDebug(`Account name: ${name}`)

    if (accountExists(hre.config.paths.secureAccounts, name)) {
      throw new SecureAccountsPluginError(`Account with name ${name} already exists!`)
    }

    const mnemonic = await getStringOrAsk(
      'mnemonic',
      'Enter mnemonic (leave empty to create a random mnemonic)',
      taskArgs.mnemonic,
    )
    const password = await getPasswordOrAsk(taskArgs.password)

    const account = await encryptAccount(hre.config.paths.secureAccounts, name, password, mnemonic)
    console.log(`Saved account ${name} to ${account.filename}`)
  })

subtask(TASK_ACCOUNTS_REMOVE, 'Remove an existing account').setAction(async (taskArgs, hre) => {
  const account = await getAccountOrAsk(taskArgs.name, hre.config.paths.secureAccounts)
  logDebug(`Attempting to delete ${account.name}...`)

  const deleteAccount = await askForConfirmation(`Are you sure you want to delete ${account.name}?`)

  if (deleteAccount) {
    fs.unlinkSync(account.filename)
    console.log(`Deleted account ${account.name} from ${account.filename}`)
  }
})
