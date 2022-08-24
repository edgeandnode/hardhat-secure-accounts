import Enquirer from 'enquirer'

import { getSecureAccount, getSecureAccounts, SecureAccount } from './account'
import { logDebug } from '../helpers/logger'
import { SecureAccountPluginError } from '../helpers/error'
// import Prompt from 'prompt-sync'

export const isRepl = !!require('repl').repl

export async function getAccountOrAsk(
  _name: string | undefined,
  accountsDir: string,
): Promise<SecureAccount> {
  logDebug(
    _name === undefined
      ? 'No account name provided, prompting user'
      : `Account name provided, skipping prompt.`,
  )

  const name = _name ?? (await askForAccount(getSecureAccounts(accountsDir)))
  logDebug(`Account name ${name}`)

  const account = getSecureAccount(accountsDir, name)
  if (account === undefined) {
    throw new SecureAccountPluginError('Account not found!')
  }
  logDebug(`Found account ${account.name} at ${account.filename}`)

  return account
}

export async function getPasswordOrAsk(_password: string | undefined): Promise<string> {
  logDebug(
    _password === undefined
      ? 'No password provided, prompting user'
      : `Password provided, skipping prompt.`,
  )

  const password = _password ?? (await askForPassword())

  if (password === undefined) {
    throw new SecureAccountPluginError('Password not provided!')
  }

  return password
}

export async function getStringOrAsk(
  name: string,
  question: string,
  _value: string | undefined,
): Promise<string> {
  logDebug(
    _value === undefined
      ? `No ${name} provided, prompting user`
      : `${name} provided, skipping prompt.`,
  )

  return _value ?? (await askForString(question))
}

async function askForAccount(accounts: SecureAccount[]): Promise<string> {
  const question = 'Choose an account to unlock'
  let answer: string = ''
  const options = accounts.map((a) => a.name)
  logDebug(`Managed accounts: ${options.join(', ')}`)

  if (isRepl) {
    // function complete(commands: string[]) {
    //   return function (str: string) {
    //     var i;
    //     var ret = [];
    //     for (i=0; i< commands.length; i++) {
    //       if (commands[i].indexOf(str) == 0)
    //         ret.push(commands[i]);
    //     }
    //     return ret;
    //   };
    // };
    // const prompt = require('prompt-sync')({
    //   autocomplete: complete(accounts.map(a => a.name))
    // })
    // answer = prompt(question)
  } else {
    const response = await Enquirer.prompt<{ account: string}>({
      type: 'select',
      name: 'account',
      message: question,
      choices: options,
    })
    answer = response.account
  }

  return answer
}

async function askForPassword(): Promise<string> {
  const question = 'Enter the password for this account'
  let answer: string = ''

  if (isRepl) {
    // const PromptSync = (await import('prompt-sync')).default()
    // var n = PromptSync('How many more times? ')
    // console.log(n)
  } else {
    const response = await Enquirer.prompt<{ password: string }>({
      type: 'password',
      name: 'password',
      message: question,
    })
    answer = response.password
  }

  return answer
}

async function askForString(question: string): Promise<string> {
  let answer: string = ''

  if (isRepl) {
    // const PromptSync = (await import('prompt-sync')).default()
    // var n = PromptSync('How many more times? ')
    // console.log(n)
  } else {
    const response = await Enquirer.prompt<{ name: string }>({
      type: 'input',
      name: 'name',
      message: question,
    })
    answer = response.name
  }

  return answer
}
