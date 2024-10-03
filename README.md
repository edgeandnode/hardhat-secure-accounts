# 🔐 Hardhat Secure Accounts

This plugin provides a secure way of storing Ethereum account private keys and mnemonics to use with [Hardhat](https://hardhat.org/). Keys are encrypted using a password and stored with [keystore](https://julien-maffre.medium.com/what-is-an-ethereum-keystore-file-86c8c5917b97). The plugin also provides several ways of unlocking and using the accounts to sign transactions and messages.

**Why**

A few reasons why you might want to use this plugin:
- You don't want to store your private keys in plain text on an `.env` file or `secrets.json`
- You don't want to update your keys when switching between accounts
- You accidentally committed your private keys to a public repository and don't want it to happen again...

**What**

What this plugin can do for you:
- Manage multiple accounts on your hardhat project using mnemonic phrases (TODO: support private keys!)
- Unlock your accounts and get a signer or provider to use with your hardhat tasks/scripts/console.

**How**

The plugin works as follow:
- Extends the Hardhat provider (`hre.network.provider`) using [extendProvider()](https://hardhat.org/hardhat-runner/docs/advanced/building-plugins#extending-the-hardhat-provider) function
- Create and access secure keystore files using [ethers](https://docs.ethers.io/v6/) to [encrypt](https://docs.ethers.org/v6/api/wallet/#Wallet-encrypt) and [decrypt](https://docs.ethers.org/v6/api/wallet/#Wallet_fromEncryptedJson) the private keys. By default keystore files are stored at the root of your project in a `.keystore` folder, you should gitignore this folder as an extra security measure.
- Extend Hardhat Runtime Environment with several methods to unlock accounts and get signer, wallet and provider instances.

## ⚠️ Disclaimers ⚠️ 

- Exercise caution when using this plugin! This plugin is mostly meant to simplify account key management for non production accounts. For any serious production work you should use more reliable and safe ways of securing your keys/contracts such as hardware wallets, multisigs, ownable contracts, etc.

- Because of how [repl](https://github.com/nodejs/repl) works it's not possible to use most of the popular prompt libraries while working on repl environments such as `npx hardhat console`. The plugin supports these environments via usage of [prompt-sync](https://www.npmjs.com/package/prompt-sync) which is a project that's not actively maintained (and it doesn't look as nice!). Please use with caution.

## Installation

To install on your hardhat project, just run

```bash
npm install hardhat-secure-accounts
```

And add the following statement to your hardhat.config.js:

```
require("hardhat-secure-accounts");
```

Or, if you are using TypeScript, add this to your hardhat.config.ts:

```
import "hardhat-secure-accounts";
```

## Configuration




## Usage

### Adding an account

To add an account to your project, run the following command:

```bash
npx hardhat accounts add
```

You'll be prompted for an account name, mnemonic and password and the account will be stored under the `.keystore` folder (unless you specify a different path via plugin configuration).

### Removing an account

To remove an account from your project, run the following command:

```bash
npx hardhat accounts remove
```

You'll be prompted for an account name and the account will be deleted.

### Listing managed accounts

You can list the accounts you have added to your project by running:

```bash
npx hardhat accounts list
```

### Using the accounts

This plugin offers a few methods for using the accounts in a Hardhat project. Depending on your workflow you might want to choose one over the other.

**Hardhat provider extension (recommended)**

The plugin extends Hardhat's default provider (`hre.network.provider`), decorating it to be a `SecureAccountsProvider` which will know how to sign transactions using the accounts you have added to your project.

Note that the provider is not extended by default. See [Configuration](#configuration) for instructions on how to enable it. Additionally, the provider will only be extended if there are accounts available in the project (which need to be created via the add command: `npx hardhat accounts add`).

**Hardhat environment extension (recommended)**

The plugin extends hardhat's environment with several convenience methods to unlock accounts. You can use these methods to get a signer or a provider instance to use with your scripts and tasks:

```typescript
import hre from 'hardhat'

const signer = await hre.accounts.getSigner()
console.log(`Account ${signer.address} unlocked!`)

await hre.accounts.provider.send('eth_sendTransaction', [{ from: signer.address, to: '0x1234', value: '0x5678' }])
```

The complete interface for the runtime environment extension is as follows:

```ts
interface SecureAccountsRuntimeEnvironment {
  provider: HardhatEthersProvider
  getSigner(name?: string, password?: string): Promise<HDNodeWallet>
  getSigners(name?: string, password?: string): Promise<HDNodeWallet[]>
}
```

Note that the provider at `hre.accounts.provider` is a `HardhatEthersProvider` created using the extended `SecureAccountsProvider` provider.

For convenience, `getSigner()` and `getSigners()` have optional parameters that allow passing the `name` and `password` of the account to unlock. If any of the optional parameters are provided the plugin will not prompt the user for that input. This might be useful for scripting or testing purposes.

Example using the different API's:

```typescript
import hre from 'hardhat'

// This will prompt the user ony for the account password
const signer = await hre.accounts.getSigner('goerli-deployer')
console.log(`Account ${signer.address} unlocked!`)

// This will not prompt the user for any input
const signer2 = await hre.accounts.getSigner('goerli-deployer', 'batman-with-cheese' )
console.log(`Account ${signer2.address} unlocked!`)
```

## Configuration

Plugin behavior can be modified via the Hardhat configuration file. The following options are available:

**Accounts directory**
By default accounts are stored in the root of your hardhat project in a `.keystore` folder. You can change this by adding the following to your Hardhat configuration file:

```ts
const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    secureAccounts: '.accounts', // This will store accounts in ./project-root/.accounts folder
  },
  ...
}
export default config
```

**Global settings**
The following optional global settings can be configured:

```ts
const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  ...
  secureAccounts: {
    enabled: true, // Enable or disable the provider extension
    defaultAccount: 'testnet-account-1', // Default account to use when unlocking accounts, setting it will skip the prompt for which account to unlock
    defaultAccountPassword: 'secret' // Default password to use when unlocking accounts, setting it will skip the prompt for a password when unlocking  -- not recommended!
  },
  ...
}
export default config
```

**Network settings**
Global settings can also be applied at the network level overriding the global settings. This is useful when you want to use different accounts for different networks:

```ts
const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  ...
  networks: {
    hardhat: {
      secureAccounts: {
        enabled: false
      }
    }
    ...
  },
  ...
  secureAccounts: {
    enabled: true
  }
}
export default config
```

## TODO
- [] Support private keys instead of mnemonic
- [] Improve help messages
- [] Improve tests

