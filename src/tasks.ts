import fs from 'fs'
import path from 'path'

import { task, subtask } from 'hardhat/config'

import { getSecureAccounts } from './lib/account'
import { logDebug } from './helpers/logger'
import { getPasswordOrAsk, getStringOrAsk } from './lib/ask'
import { SecureAccountPluginError } from './helpers/error'

task('accounts', 'Manage local accounts')
  .addOptionalPositionalParam('action', 'Action to perform: list, import, delete')
  .setAction(async (taskArgs, hre) => {
    if (taskArgs.action === undefined) {
      console.log('No action specified')
      return
    }

    try {
      logDebug(`Running action ${taskArgs.action}`)
      await hre.run(`accounts:${taskArgs.action}`, taskArgs)
    } catch (error) {
      console.log(error)
    }
  })

subtask('accounts:new', 'Add a new account via mnemonic.')
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

subtask('accounts:list', 'List local accounts').setAction(async (_, hre) => {
  const accounts = getSecureAccounts(hre.config.paths.accounts)

  console.log('Managed accounts:')
  for (const account of accounts) {
    console.log(`> ${account.name} - 0x${JSON.parse(account.json).address}`)
  }
})

subtask('accounts:unlock', 'Unlock account').setAction(async (_, hre) => {
  const signer = await hre.accounts.getSigner()
  console.log(`Account ${signer.address} unlocked`)
  return signer
})
