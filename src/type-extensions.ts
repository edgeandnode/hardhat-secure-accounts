import "hardhat/types/config";
import "hardhat/types/runtime";
import { Wallet } from 'ethers'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EthersProviderWrapper } from "@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper";

declare module "hardhat/types/config" {
  export interface ProjectPathsUserConfig {
    accounts?: string;
  }

  export interface ProjectPathsConfig {
    accounts: string;
  }
}

export interface AccountsRuntimeEnvironment {
  getWallet(name?: string, password?: string): Promise<Wallet>
  getWallets(name?: string, password?: string): Promise<Wallet[]>
  getSigner(name?: string, password?: string): Promise<SignerWithAddress>
  getSigners(name?: string, password?: string): Promise<SignerWithAddress[]>
  getProvider(): Promise<EthersProviderWrapper>
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    accounts: AccountsRuntimeEnvironment
  }
}
