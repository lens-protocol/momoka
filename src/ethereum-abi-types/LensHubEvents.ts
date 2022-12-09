import { EthersContractContextV5 } from 'ethereum-abi-types-generator';
import { BigNumber, BigNumberish, BytesLike as Arrayish } from 'ethers';

export type ContractContext = EthersContractContextV5<
  LensHubEvents,
  LensHubEventsMethodNames,
  LensHubEventsEventsContext,
  LensHubEventsEvents
>;

export declare type EventFilter = {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
};

export interface ContractTransactionOverrides {
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
  /**
   * The price (in wei) per unit of gas
   */
  gasPrice?: BigNumber | string | number | Promise<any>;
  /**
   * The nonce to use in the transaction
   */
  nonce?: number;
  /**
   * The amount to send with the transaction (i.e. msg.value)
   */
  value?: BigNumber | string | number | Promise<any>;
  /**
   * The chain ID (or network ID) to use
   */
  chainId?: number;
}

export interface ContractCallOverrides {
  /**
   * The address to execute the call as
   */
  from?: string;
  /**
   * The maximum units of gas for the transaction to use
   */
  gasLimit?: number;
}
export type LensHubEventsEvents =
  | 'BaseInitialized'
  | 'CollectModuleWhitelisted'
  | 'CollectNFTDeployed'
  | 'CollectNFTInitialized'
  | 'CollectNFTTransferred'
  | 'Collected'
  | 'CommentCreated'
  | 'DefaultProfileSet'
  | 'DispatcherSet'
  | 'EmergencyAdminSet'
  | 'FeeModuleBaseConstructed'
  | 'FollowModuleSet'
  | 'FollowModuleWhitelisted'
  | 'FollowNFTDelegatedPowerChanged'
  | 'FollowNFTDeployed'
  | 'FollowNFTInitialized'
  | 'FollowNFTTransferred'
  | 'FollowNFTURISet'
  | 'Followed'
  | 'FollowsApproved'
  | 'FollowsToggled'
  | 'GovernanceSet'
  | 'MirrorCreated'
  | 'ModuleBaseConstructed'
  | 'ModuleGlobalsCurrencyWhitelisted'
  | 'ModuleGlobalsGovernanceSet'
  | 'ModuleGlobalsTreasuryFeeSet'
  | 'ModuleGlobalsTreasurySet'
  | 'PostCreated'
  | 'ProfileCreated'
  | 'ProfileCreatorWhitelisted'
  | 'ProfileImageURISet'
  | 'ProfileMetadataSet'
  | 'ReferenceModuleWhitelisted'
  | 'StateSet';
export interface LensHubEventsEventsContext {
  BaseInitialized(...parameters: any): EventFilter;
  CollectModuleWhitelisted(...parameters: any): EventFilter;
  CollectNFTDeployed(...parameters: any): EventFilter;
  CollectNFTInitialized(...parameters: any): EventFilter;
  CollectNFTTransferred(...parameters: any): EventFilter;
  Collected(...parameters: any): EventFilter;
  CommentCreated(...parameters: any): EventFilter;
  DefaultProfileSet(...parameters: any): EventFilter;
  DispatcherSet(...parameters: any): EventFilter;
  EmergencyAdminSet(...parameters: any): EventFilter;
  FeeModuleBaseConstructed(...parameters: any): EventFilter;
  FollowModuleSet(...parameters: any): EventFilter;
  FollowModuleWhitelisted(...parameters: any): EventFilter;
  FollowNFTDelegatedPowerChanged(...parameters: any): EventFilter;
  FollowNFTDeployed(...parameters: any): EventFilter;
  FollowNFTInitialized(...parameters: any): EventFilter;
  FollowNFTTransferred(...parameters: any): EventFilter;
  FollowNFTURISet(...parameters: any): EventFilter;
  Followed(...parameters: any): EventFilter;
  FollowsApproved(...parameters: any): EventFilter;
  FollowsToggled(...parameters: any): EventFilter;
  GovernanceSet(...parameters: any): EventFilter;
  MirrorCreated(...parameters: any): EventFilter;
  ModuleBaseConstructed(...parameters: any): EventFilter;
  ModuleGlobalsCurrencyWhitelisted(...parameters: any): EventFilter;
  ModuleGlobalsGovernanceSet(...parameters: any): EventFilter;
  ModuleGlobalsTreasuryFeeSet(...parameters: any): EventFilter;
  ModuleGlobalsTreasurySet(...parameters: any): EventFilter;
  PostCreated(...parameters: any): EventFilter;
  ProfileCreated(...parameters: any): EventFilter;
  ProfileCreatorWhitelisted(...parameters: any): EventFilter;
  ProfileImageURISet(...parameters: any): EventFilter;
  ProfileMetadataSet(...parameters: any): EventFilter;
  ReferenceModuleWhitelisted(...parameters: any): EventFilter;
  StateSet(...parameters: any): EventFilter;
}
export type LensHubEventsMethodNames = undefined;
export interface BaseInitializedEventEmittedResponse {
  name: string;
  symbol: string;
  timestamp: BigNumberish;
}
export interface CollectModuleWhitelistedEventEmittedResponse {
  collectModule: string;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface CollectNFTDeployedEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  collectNFT: string;
  timestamp: BigNumberish;
}
export interface CollectNFTInitializedEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  timestamp: BigNumberish;
}
export interface CollectNFTTransferredEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  collectNFTId: BigNumberish;
  from: string;
  to: string;
  timestamp: BigNumberish;
}
export interface CollectedEventEmittedResponse {
  collector: string;
  profileId: BigNumberish;
  pubId: BigNumberish;
  rootProfileId: BigNumberish;
  rootPubId: BigNumberish;
  collectModuleData: Arrayish;
  timestamp: BigNumberish;
}
export interface CommentCreatedEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  contentURI: string;
  profileIdPointed: BigNumberish;
  pubIdPointed: BigNumberish;
  referenceModuleData: Arrayish;
  collectModule: string;
  collectModuleReturnData: Arrayish;
  referenceModule: string;
  referenceModuleReturnData: Arrayish;
  timestamp: BigNumberish;
}
export interface DefaultProfileSetEventEmittedResponse {
  wallet: string;
  profileId: BigNumberish;
  timestamp: BigNumberish;
}
export interface DispatcherSetEventEmittedResponse {
  profileId: BigNumberish;
  dispatcher: string;
  timestamp: BigNumberish;
}
export interface EmergencyAdminSetEventEmittedResponse {
  caller: string;
  oldEmergencyAdmin: string;
  newEmergencyAdmin: string;
  timestamp: BigNumberish;
}
export interface FeeModuleBaseConstructedEventEmittedResponse {
  moduleGlobals: string;
  timestamp: BigNumberish;
}
export interface FollowModuleSetEventEmittedResponse {
  profileId: BigNumberish;
  followModule: string;
  followModuleReturnData: Arrayish;
  timestamp: BigNumberish;
}
export interface FollowModuleWhitelistedEventEmittedResponse {
  followModule: string;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface FollowNFTDelegatedPowerChangedEventEmittedResponse {
  delegate: string;
  newPower: BigNumberish;
  timestamp: BigNumberish;
}
export interface FollowNFTDeployedEventEmittedResponse {
  profileId: BigNumberish;
  followNFT: string;
  timestamp: BigNumberish;
}
export interface FollowNFTInitializedEventEmittedResponse {
  profileId: BigNumberish;
  timestamp: BigNumberish;
}
export interface FollowNFTTransferredEventEmittedResponse {
  profileId: BigNumberish;
  followNFTId: BigNumberish;
  from: string;
  to: string;
  timestamp: BigNumberish;
}
export interface FollowNFTURISetEventEmittedResponse {
  profileId: BigNumberish;
  followNFTURI: string;
  timestamp: BigNumberish;
}
export interface FollowedEventEmittedResponse {
  follower: string;
  profileIds: BigNumberish[];
  followModuleDatas: Arrayish[];
  timestamp: BigNumberish;
}
export interface FollowsApprovedEventEmittedResponse {
  owner: string;
  profileId: BigNumberish;
  addresses: string[];
  approved: boolean[];
  timestamp: BigNumberish;
}
export interface FollowsToggledEventEmittedResponse {
  owner: string;
  profileIds: BigNumberish[];
  enabled: boolean[];
  timestamp: BigNumberish;
}
export interface GovernanceSetEventEmittedResponse {
  caller: string;
  prevGovernance: string;
  newGovernance: string;
  timestamp: BigNumberish;
}
export interface MirrorCreatedEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  profileIdPointed: BigNumberish;
  pubIdPointed: BigNumberish;
  referenceModuleData: Arrayish;
  referenceModule: string;
  referenceModuleReturnData: Arrayish;
  timestamp: BigNumberish;
}
export interface ModuleBaseConstructedEventEmittedResponse {
  hub: string;
  timestamp: BigNumberish;
}
export interface ModuleGlobalsCurrencyWhitelistedEventEmittedResponse {
  currency: string;
  prevWhitelisted: boolean;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface ModuleGlobalsGovernanceSetEventEmittedResponse {
  prevGovernance: string;
  newGovernance: string;
  timestamp: BigNumberish;
}
export interface ModuleGlobalsTreasuryFeeSetEventEmittedResponse {
  prevTreasuryFee: BigNumberish;
  newTreasuryFee: BigNumberish;
  timestamp: BigNumberish;
}
export interface ModuleGlobalsTreasurySetEventEmittedResponse {
  prevTreasury: string;
  newTreasury: string;
  timestamp: BigNumberish;
}
export interface PostCreatedEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  contentURI: string;
  collectModule: string;
  collectModuleReturnData: Arrayish;
  referenceModule: string;
  referenceModuleReturnData: Arrayish;
  timestamp: BigNumberish;
}
export interface ProfileCreatedEventEmittedResponse {
  profileId: BigNumberish;
  creator: string;
  to: string;
  handle: string;
  imageURI: string;
  followModule: string;
  followModuleReturnData: Arrayish;
  followNFTURI: string;
  timestamp: BigNumberish;
}
export interface ProfileCreatorWhitelistedEventEmittedResponse {
  profileCreator: string;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface ProfileImageURISetEventEmittedResponse {
  profileId: BigNumberish;
  imageURI: string;
  timestamp: BigNumberish;
}
export interface ProfileMetadataSetEventEmittedResponse {
  profileId: BigNumberish;
  metadata: string;
  timestamp: BigNumberish;
}
export interface ReferenceModuleWhitelistedEventEmittedResponse {
  referenceModule: string;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface StateSetEventEmittedResponse {
  caller: string;
  prevState: BigNumberish;
  newState: BigNumberish;
  timestamp: BigNumberish;
}
export interface LensHubEvents {}
