import { expect } from 'chai'
import { useEnvironment } from './helpers'

import { TEST_MNEMONIC, TEST_ADDRESSES, TEST_NAME, TEST_PASSWORD, TEST_SIGNED_MESSAGE } from './mnemonics'
import { TASK_ACCOUNTS_NEW } from '../src/tasks'
import { EthersProviderWrapper } from '@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper'

describe('Extended environment usage', function () {
  useEnvironment('hardhat-project', 'hardhat')

  it('should unlock account and return a single wallet', async function () {
    const wallet = await this.hre.accounts.getWallet(TEST_NAME, TEST_PASSWORD)
  
    expect(wallet.address).to.equal(TEST_ADDRESSES[0])
    expect(wallet.mnemonic.phrase).to.equal(TEST_MNEMONIC)
    expect(wallet.provider).to.be.null
    expect(await wallet.signMessage('test')).to.equal(TEST_SIGNED_MESSAGE)
  })

  it('should unlock account and return multiple wallets', async function () {
    const wallets = await this.hre.accounts.getWallets(TEST_NAME, TEST_PASSWORD)

    expect(wallets.length).to.equal(20)

    for (let i = 0; i < 20; i++) {
      expect(wallets[i].address).to.equal(TEST_ADDRESSES[i])
      expect(wallets[i].mnemonic).to.be.null
      expect(wallets[i].provider).to.be.null
      expect(await wallets[i].signMessage('test')).not.to.throw
    }
  })

  it('should unlock account and return a single signer', async function () {
    const signer = await this.hre.accounts.getSigner(this.hre.network, TEST_NAME, TEST_PASSWORD)
 
    expect(signer.address).to.equal(TEST_ADDRESSES[0])
    expect(await signer.signMessage('test')).to.equal(TEST_SIGNED_MESSAGE)
    expect(signer.provider).to.not.be.null
  })

  it('should unlock account and return multiple signers', async function () {
    const signers = await this.hre.accounts.getSigners(this.hre.network, TEST_NAME, TEST_PASSWORD)
 
    expect(signers.length).to.equal(20)

    for (let i = 0; i < 20; i++) {
      expect(signers[i].address).to.equal(TEST_ADDRESSES[i])
      expect(signers[i].provider).to.not.be.null
      expect(await signers[i].signMessage('test')).not.to.throw
    }
  })

  it('should unlock account and return a provider', async function () {
    const provider = await this.hre.accounts.getProvider(this.hre.network, TEST_NAME, TEST_PASSWORD)

    expect(provider).to.not.be.null
    expect(provider).to.be.an('object')
    
    const signer = provider.getSigner()
    expect(await signer.getAddress()).to.equal(TEST_ADDRESSES[0])
    expect(await signer.signMessage('test')).to.equal(TEST_SIGNED_MESSAGE)
    expect(signer.provider).to.not.be.null
  })

})
