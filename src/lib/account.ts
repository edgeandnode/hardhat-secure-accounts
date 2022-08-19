import fs from 'fs'
import path from 'path'

export interface SecureAccount {
  name: string
  filename: string
  json: string
}

export function getSecureAccounts(rootDir: string): SecureAccount[] {
  return fs.readdirSync(rootDir).map((a) => ({
    name: path.parse(a).name,
    filename: path.join(rootDir, a),
    json: fs.readFileSync(path.join(rootDir, a), 'utf8'),
  }))
}

export function getSecureAccount(rootDir: string, name: string): SecureAccount | undefined {
  const accounts = getSecureAccounts(rootDir)
  return accounts.find((a) => a.name === name)
}
