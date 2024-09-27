import { HardhatPluginError } from 'hardhat/plugins'
import { logError } from './logger'

export class SecureAccountsPluginError extends HardhatPluginError {
  constructor(_error: string | Error) {
    const error = _error instanceof Error ? _error : undefined
    const message = _error instanceof Error ? _error.message : _error

    super('SecureAccount', message, error)
    logError(message)
  }
}
