import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { HardhatNetworkAccountsConfig } from 'hardhat/types'
import { useEnvironment } from './helpers'

import {
  TEST_MNEMONIC,
  TEST_ADDRESSES,
  TEST_NAME,
  TEST_PASSWORD,
  TEST_SIGNED_MESSAGE,
} from './mnemonics'

chai.use(chaiAsPromised)

describe('Extended environment usage > project using mnemonic', function () {
  useEnvironment('hardhat-project', 'hardhat')
  runTests()
})

describe('Extended environment usage > project using private keys', function () {
  useEnvironment('hardhat-project-pkeys', 'hardhat')
  runTests()
})

function runTests() {
  it.only('should unlock account and return a single wallet', async function () {
    const wallet = await this.hre.accounts.getWallet(TEST_NAME, TEST_PASSWORD)

    expect(wallet.address).to.equal(TEST_ADDRESSES[0])
    expect(wallet?.mnemonic?.phrase).to.equal(TEST_MNEMONIC)
    expect(wallet.provider).to.be.null
    expect(wallet.signMessage('test')).to.eventually.equal(TEST_SIGNED_MESSAGE)
  })

  it('should unlock account and return multiple wallets', async function () {
    const wallets = await this.hre.accounts.getWallets(TEST_NAME, TEST_PASSWORD)

    expect(wallets.length).to.equal(20)

    for (let i = 0; i < 20; i++) {
      expect(wallets[i].address).to.equal(TEST_ADDRESSES[i])
      expect(wallets[i].mnemonic).to.be.null
      expect(wallets[i].provider).to.be.null
      expect(wallets[i].signMessage('test')).to.eventually.be.fulfilled
    }
  })

  it('should unlock account and return a single signer', async function () {
    const signer = await this.hre.accounts.getSigner(this.hre.network, TEST_NAME, TEST_PASSWORD)

    expect(signer.address).to.equal(TEST_ADDRESSES[0])
    expect(signer.signMessage('test')).to.eventually.equal(TEST_SIGNED_MESSAGE)
    expect(signer.provider).to.not.be.null
  })

  it('should unlock account and return multiple signers', async function () {
    const signers = await this.hre.accounts.getSigners(this.hre.network, TEST_NAME, TEST_PASSWORD)

    expect(signers.length).to.equal(20)

    for (let i = 0; i < 20; i++) {
      expect(signers[i].address).to.equal(TEST_ADDRESSES[i])
      expect(signers[i].provider).to.not.be.null
      expect(signers[i].signMessage('test')).to.eventually.be.fulfilled
    }
  })

  it('should unlock account and return a provider', async function () {
    const provider = await this.hre.accounts.getProvider(this.hre.network, TEST_NAME, TEST_PASSWORD)

    expect(provider).to.not.be.null
    expect(provider).to.be.an('object')

    const signer = provider.getSigner()
    expect(signer.getAddress()).to.eventually.equal(TEST_ADDRESSES[0])
    expect(signer.signMessage('test')).to.eventually.equal(TEST_SIGNED_MESSAGE)
    expect(signer.provider).to.not.be.null
  })
}
