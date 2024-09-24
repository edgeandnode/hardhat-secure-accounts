import { HardhatConfig, Network } from 'hardhat/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { logDebug } from '../helpers/logger'
import { getProvider } from './provider'

export async function getSigner(
  config: HardhatConfig,
  network: Network,
  accountsDir: string,
  name?: string,
  password?: string,
): Promise<SignerWithAddress> { 
  const provider = await getProvider(config, network, accountsDir, name, password)

  const signer = provider.getSigner()
  const signerWithAddress = await SignerWithAddress.create(signer)

  logDebug(`Signer address: ${signerWithAddress.address}`)
  return signerWithAddress
}

export async function getSigners(
  network: Network,
  accountsDir: string,
  name?: string,
  password?: string,
): Promise<SignerWithAddress[]> {
  const provider = await getProvider(network, accountsDir, name, password)
  
  const accounts = await provider.listAccounts()
  const signersWithAddress = await Promise.all(
    accounts.map((account) => SignerWithAddress.create(provider.getSigner(account))),
  )

  logDebug(`Got ${accounts.length} accounts from provider`)
  return signersWithAddress
}
