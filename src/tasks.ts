import fs from 'fs'
import path from 'path'

import { task, subtask } from 'hardhat/config'

import { getSecureAccounts } from './lib/account'
import { logDebug } from './helpers/logger'

task('accounts', 'Manage local accounts')
  .addOptionalPositionalParam('action', 'Action to perform: list, import, delete')
  .addOptionalParam('name', '[new] Name of the account')
  .addOptionalParam('mnemonic', '[new] Mnemonic to derive the account from')
  .addOptionalParam('password', '[new] Password used to encrypt the account')
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
  .addParam('name', 'Name of the account')
  .addParam('mnemonic', 'Mnemonic to derive the account from')
  .addParam('password', 'Password used to encrypt the account')
  .setAction(async (taskArgs, hre) => {
    const wallet = hre.ethers.Wallet.fromMnemonic(taskArgs.mnemonic)
    const encrypted = await wallet.encrypt(taskArgs.password)
    const fileName = path.join(hre.config.paths.accounts, `${taskArgs.name}.json`)

    // Ensure accounts dir exists
    if (!fs.existsSync(hre.config.paths.accounts)) {
      fs.mkdirSync(hre.config.paths.accounts)
      logDebug(`Created accounts directory: ${hre.config.paths.accounts}`)
    }

    // Write encrypted account to file
    fs.writeFileSync(fileName, encrypted, 'utf8')
  })

subtask('accounts:list', 'List local accounts').setAction(async (taskArgs, hre) => {
  const accounts = getSecureAccounts(hre.config.paths.accounts)

  console.log('Managed accounts:')
  for (const account of accounts) {
    console.log(`> ${account.name}`)
  }
})

subtask('accounts:unlock', 'Unlock an account').setAction(async (taskArgs, hre) => {
  const signer = await hre.accounts.getSigner('account-goerli-1', 'batata')
  console.log(`Account ${signer.address} unlocked`)
  console.log(await signer.signMessage('test'))

  const wallet = await hre.accounts.getWallet('account-goerli-1', 'batata')
  console.log(`Address is ${wallet.address}`)
  console.log(await wallet.signMessage('test'))

  const wallets = await hre.accounts.getWallets('account-goerli-1', 'batata')
  wallets.map((w) => console.log(`Address is ${w.address}`))
  for (const wallet of wallets) {
    console.log(await wallet.signMessage('test'))
  }

  const signers = await hre.accounts.getSigners('account-goerli-1', 'batata')
  signers.map((s) => console.log(`Address is ${s.address}`))
  for (const signer of signers) {
    console.log(await signer.signMessage('test'))
  }

})

subtask('accounts:inject', 'Inject accounts into network config').setAction(
  async (taskArgs, hre) => {
    const signers = await hre.ethers.getSigners()
    signers.map((s) => console.log(s.address))

    await hre.accounts.getProvider()

    const signers2 = await hre.ethers.getSigners()
    signers2.map((s) => console.log(s.address))
  },
)
