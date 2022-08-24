# 🔐 Hardhat Secure Accounts

This plugin provides a secure way of storing private keys to use with [Hardhat](https://hardhat.org/). The keys are encrypted using a user-provided password and stored using [keystore](https://julien-maffre.medium.com/what-is-an-ethereum-keystore-file-86c8c5917b97). The plugin also provides several ways of unlocking and using the accounts to sign transactions and messages.


__⚠️ Disclaimer ⚠️__: Exercise caution when using this plugin! For any serious production work you should use more reliable and safe ways of securing your keys/contracts such as hardware wallets, multisigs, ownable contracts, etc.

**Why**
A few reasons why you might want to use this plugin:
- You don't want to store your private keys in plain text on an `.env` file or `secrets.json`
- You don't want to update your keys when switching between accounts
- You accidentally committed your private keys to a public repository and don't want it to happen again...

**What**
What this plugin can do for you:
- Manage multiple accounts on your hardhat project using mnemonic phrases (TODO: support private keys!)
- Create and access secure keystore files using [ethers](https://docs.ethers.io/v5/) to [encrypt](https://docs.ethers.io/v5/api/signer/#Wallet-encrypt) and [decrypt](https://docs.ethers.io/v5/api/signer/#Wallet-fromEncryptedJsonSync) the private keys. By default keystore files are stored at the root of your project in a `.keystore` folder, you should gitignore this folder as an extra security measure.
- Unlock your accounts and get a wallet, signer or provider to use with your hardhat tasks/scripts/console.

---

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

---

## Usage

#### Adding an account

To add an account to your project, run the following command:

```bash
npx hardhat accounts new
```

You'll be prompted for an account name, mnemonic and password and the account will be stored under the `.keystore` folder (unless you specify a different path via plugin configuration).

#### Listing managed accounts

You can list the accounts you have added to your project by running:

```bash
npx hardhat accounts list
```

#### Unlocking an account

This plugin offers two methods for unlocking accounts and several ways of using the unlocked account. Depending on your workflow you might want to choose one over the other.

Accounts can be unlocked using:
- Hardhat tasks
- Hardhat environment extension

With the unlocked account you can:
- Get one or multiple wallet instances (`ethers' Wallet`)
- Get a provider instance (`hardhat's EthersProviderWrapper`)
- Get one or multiple signer instances (`hardhat's SignerWithAddress`)

**Hardhat environment extension (recommended)**

The plugin extends hardhat's environment with several convenience methods to unlock accounts. You can use these methods to get a signer, wallet or provider instance to use with your scripts and tasks:

```typescript
import hre from 'hardhat'

const signer = await hre.accounts.getSigner()
console.log(`Account ${signer.address} unlocked!`)
```

See [API reference](#api-reference) for a complete list of the available methods.

**Hardhat tasks**

For a quick account unlock using the CLI:

```bash
npx hardhat accounts unlock
```

This can be useful to validate an account password but not much else since the account only remains unlocked until the task ends its execution. If you want to use it in the context of a script/task you can run the task programmatically:

```typescript
import hre from 'hre'
import { TASK_ACCOUNTS_UNLOCK_SIGNER } from 'hardhat-secure-accounts'

const signer = await hre.run(TASK_ACCOUNTS_UNLOCK_SIGNER)
console.log(`Account ${signer.address} unlocked!`)
```

See [API reference](#api-reference) for a complete list of the available tasks.

---

#### API reference

| Task | CLI | Hardhat task | Hardhat environment extension | Description |
| --- | --- | --- | --- | --- |
| Unlock wallet  | `npx hardhat accounts unlock:wallet` | `TASK_ACCOUNTS_UNLOCK_WALLET` | `await hre.accounts.getWallet()` | Returns the main wallet from the mnemonic derivation path. Return type: `Wallet` |
| Unlock wallets | `npx hardhat accounts unlock:wallets` | `TASK_ACCOUNTS_UNLOCK_WALLETS` | `await hre.accounts.getWallets()` | Returns multiple wallets (20) derived from the mnemonic. Return type: `Wallet[]` |
| Unlock signer  | `npx hardhat accounts unlock` | `TASK_ACCOUNTS_UNLOCK_SIGNER` | `await hre.accounts.getSigner()` | Returns the main signer from the mnemonic derivation path. Return type: `SignerWithAddress` |
| Unlock signers | `npx hardhat accounts unlock:signers` | `TASK_ACCOUNTS_UNLOCK_SIGNERS` | `await hre.accounts.getSigners()` | Returns multiple signers (20) derived from the mnemonic. Return type: `SignerWithAddress[]` |
| Unlock provider | `npx hardhat accounts unlock:provider` | `TASK_ACCOUNTS_UNLOCK_PROVIDER` | `await hre.accounts.getProvider()` | Returns a provider with pre-configured local accounts based on the mnemonic. Return type: `EthersProviderWrapper` |

**Optional parameters**

For convenience, all of the tasks and methods listed above have optional parameters that allow passing the `name` and `password` of the account to unlock. If any of the optional parameters are provided the plugin will not prompt the user for that input. This might be useful for scripting or testing purposes.

Example using the different API's:

```typescript
import hre from 'hardhat'

// This will prompt the user ony for the account password
const signer = await hre.accounts.getSigner('goerli-deployer')
console.log(`Account ${signer.address} unlocked!`)

// This will not prompt the user for any input
const signer2 = await hre.run(TASK_ACCOUNTS_UNLOCK_SIGNER, { name: 'goerli-deployer', password: 'batman-with-cheese' })
console.log(`Account ${signer2.address} unlocked!`)
```

Or using the CLI:

```bash
# This will prompt the user only for the account password
npx hardhat accounts unlock --name goerli-deployer
```

---

## Configuration

By default accounts are stored in the root of your hardhat project in a `.keystore` folder. You can change this by adding the following to your hardhat.config.js:

```js
require('hardhat-secure-accounts')

module.exports = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    accounts: '.accounts',
  },
};
```

Or if you are using TypeScript, modify your `hardhat.config.ts`:

```ts
import { HardhatUserConfig } from 'hardhat/types'

import 'hardhat-secure-accounts'

const config: HardhatUserConfig = {
  solidity: '0.7.3',
  defaultNetwork: 'hardhat',
  paths: {
    accounts: '.accounts',
  },
  ...
}

export default config
```

---

## TODO
- [] Support private keys instead of mnemonic
- [] Support repl environments such as `npx hardhat console`
- [] Improve help messages
- [] Improve tests

