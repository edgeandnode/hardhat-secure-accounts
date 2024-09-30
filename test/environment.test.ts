import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { useEnvironment } from './helpers'
import { getAddress } from 'ethers'

import {
  TEST_MNEMONIC,
  TEST_ADDRESSES,
  TEST_NAME,
  TEST_PASSWORD,
  TEST_SIGNED_MESSAGE,
  HARDHAT_ADDRESSES,
} from './mnemonics'

chai.use(chaiAsPromised)

describe('Extended environment usage > project not using Secure Accounts', function () {
  useEnvironment('hardhat-project', 'hardhat')

  it('should manage its own accounts', async function () {
    const accounts = (await this.hre.network.provider.request({
      method: 'eth_accounts',
    })) as string[]
    for (let i = 0; i < accounts.length; i++) {
      expect(getAddress(accounts[i])).to.equal(HARDHAT_ADDRESSES[i])
    }
  })
})

describe('Extended environment usage > project using Secure Accounts', function () {
  useEnvironment('hardhat-project-config', 'hardhat')

  it('should manage secured accounts', async function () {
    const accounts = (await this.hre.network.provider.request({
      method: 'eth_accounts',
    })) as string[]
    for (let i = 0; i < accounts.length; i++) {
      expect(getAddress(accounts[i])).to.equal(TEST_ADDRESSES[i])
    }
  })

  it('should have signing keys for secured accounts', async function () {})

  it('should unlock account and return a single wallet', async function () {
    const wallet = await this.hre.accounts.getSigner(TEST_NAME, TEST_PASSWORD)

    expect(wallet.address).to.equal(TEST_ADDRESSES[0])
    expect(wallet?.mnemonic?.phrase).to.equal(TEST_MNEMONIC)
    expect(wallet.provider).not.to.be.null
    expect(wallet.signMessage('test')).to.eventually.equal(TEST_SIGNED_MESSAGE)
  })

  it('should unlock account and return multiple wallets', async function () {
    const wallets = await this.hre.accounts.getSigners(TEST_NAME, TEST_PASSWORD)

    expect(wallets.length).to.equal(20)

    for (let i = 0; i < 20; i++) {
      expect(wallets[i].address).to.equal(TEST_ADDRESSES[i])
      expect(wallets[i].mnemonic?.phrase).to.equal(TEST_MNEMONIC)
      expect(wallets[i].provider).not.to.be.null
      expect(wallets[i].signMessage('test')).to.eventually.be.fulfilled
    }
  })
})
