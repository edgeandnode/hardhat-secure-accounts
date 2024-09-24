import "hardhat/types/config";
import "hardhat/types/runtime";
import { HDNodeWallet } from 'ethers'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EthersProviderWrapper } from "@nomiclabs/hardhat-ethers/internal/ethers-provider-wrapper";
import { Network } from "hardhat/types/runtime";

declare module "hardhat/types/config" {
  export interface ProjectPathsUserConfig {
    accounts?: string;
  }

  export interface ProjectPathsConfig {
    accounts: string;
  }
}

export interface AccountsRuntimeEnvironment {
  getWallet(name?: string, password?: string): Promise<HDNodeWallet>
  getWallets(name?: string, password?: string): Promise<HDNodeWallet[]>
  getSigner(network?: Network, name?: string, password?: string): Promise<SignerWithAddress>
  getSigners(network?: Network, name?: string, password?: string): Promise<SignerWithAddress[]>
  getProvider(network?: Network, name?: string, password?: string): Promise<EthersProviderWrapper>
}

declare module "hardhat/types/runtime" {
  export interface HardhatRuntimeEnvironment {
    accounts: AccountsRuntimeEnvironment
  }
}
