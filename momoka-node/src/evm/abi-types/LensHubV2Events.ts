import { EthersContractContextV5 } from 'ethereum-abi-types-generator';
import { BytesLike as Arrayish, BigNumber, BigNumberish } from 'ethers';

export type ContractContext = EthersContractContextV5<
  LensHubEvents,
  LensHubEventsMethodNames,
  LensHubEventsEventsContext,
  LensHubEventsEvents
>;

export declare interface EventFilter {
  address?: string;
  topics?: Array<string>;
  fromBlock?: string | number;
  toBlock?: string | number;
}

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
  | 'Acted'
  | 'ActionModuleWhitelisted'
  | 'BaseInitialized'
  | 'Blocked'
  | 'CollectNFTDeployed'
  | 'CollectNFTTransferred'
  | 'Collected'
  | 'CommentCreated'
  | 'DelegatedExecutorsConfigApplied'
  | 'DelegatedExecutorsConfigChanged'
  | 'EmergencyAdminSet'
  | 'FollowModuleSet'
  | 'FollowModuleWhitelisted'
  | 'FollowNFTDeployed'
  | 'Followed'
  | 'GovernanceSet'
  | 'MirrorCreated'
  | 'ModuleGlobalsCurrencyWhitelisted'
  | 'ModuleGlobalsGovernanceSet'
  | 'ModuleGlobalsTreasuryFeeSet'
  | 'ModuleGlobalsTreasurySet'
  | 'PostCreated'
  | 'ProfileCreated'
  | 'ProfileCreatorWhitelisted'
  | 'ProfileMetadataSet'
  | 'QuoteCreated'
  | 'ReferenceModuleWhitelisted'
  | 'StateSet'
  | 'TokenGuardianStateChanged'
  | 'Unblocked'
  | 'Unfollowed'
  | 'NonceUpdated'
  | 'LensUpgradeVersion'
  | 'CollectedLegacy';
export interface LensHubEventsEventsContext {
  Acted(...parameters: any): EventFilter;
  ActionModuleWhitelisted(...parameters: any): EventFilter;
  BaseInitialized(...parameters: any): EventFilter;
  Blocked(...parameters: any): EventFilter;
  CollectNFTDeployed(...parameters: any): EventFilter;
  CollectNFTTransferred(...parameters: any): EventFilter;
  Collected(...parameters: any): EventFilter;
  CommentCreated(...parameters: any): EventFilter;
  DelegatedExecutorsConfigApplied(...parameters: any): EventFilter;
  DelegatedExecutorsConfigChanged(...parameters: any): EventFilter;
  EmergencyAdminSet(...parameters: any): EventFilter;
  FollowModuleSet(...parameters: any): EventFilter;
  FollowModuleWhitelisted(...parameters: any): EventFilter;
  FollowNFTDeployed(...parameters: any): EventFilter;
  Followed(...parameters: any): EventFilter;
  GovernanceSet(...parameters: any): EventFilter;
  MirrorCreated(...parameters: any): EventFilter;
  ModuleGlobalsCurrencyWhitelisted(...parameters: any): EventFilter;
  ModuleGlobalsGovernanceSet(...parameters: any): EventFilter;
  ModuleGlobalsTreasuryFeeSet(...parameters: any): EventFilter;
  ModuleGlobalsTreasurySet(...parameters: any): EventFilter;
  PostCreated(...parameters: any): EventFilter;
  ProfileCreated(...parameters: any): EventFilter;
  ProfileCreatorWhitelisted(...parameters: any): EventFilter;
  ProfileMetadataSet(...parameters: any): EventFilter;
  QuoteCreated(...parameters: any): EventFilter;
  ReferenceModuleWhitelisted(...parameters: any): EventFilter;
  StateSet(...parameters: any): EventFilter;
  TokenGuardianStateChanged(...parameters: any): EventFilter;
  Unblocked(...parameters: any): EventFilter;
  Unfollowed(...parameters: any): EventFilter;
  NonceUpdated(...parameters: any): EventFilter;
  LensUpgradeVersion(...parameters: any): EventFilter;
  CollectedLegacy(...parameters: any): EventFilter;
}
export type LensHubEventsMethodNames = undefined;
export interface PublicationActionParamsEventEmittedResponse {
  publicationActedProfileId: BigNumberish;
  publicationActedId: BigNumberish;
  actorProfileId: BigNumberish;
  referrerProfileIds: BigNumberish[];
  referrerPubIds: BigNumberish[];
  actionModuleAddress: string;
  actionModuleData: Arrayish;
}
export interface ActedEventEmittedResponse {
  publicationActionParams: PublicationActionParamsEventEmittedResponse;
  actionModuleReturnData: Arrayish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface ActionModuleWhitelistedEventEmittedResponse {
  actionModule: string;
  id: BigNumberish;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface BaseInitializedEventEmittedResponse {
  name: string;
  symbol: string;
  timestamp: BigNumberish;
}
export interface BlockedEventEmittedResponse {
  byProfileId: BigNumberish;
  idOfProfileBlocked: BigNumberish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface CollectNFTDeployedEventEmittedResponse {
  profileId: BigNumberish;
  pubId: BigNumberish;
  collectNFT: string;
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
  collectedProfileId: BigNumberish;
  collectedPubId: BigNumberish;
  collectorProfileId: BigNumberish;
  nftRecipient: string;
  collectActionData: Arrayish;
  collectActionResult: Arrayish;
  collectNFT: string;
  tokenId: BigNumberish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface CommentParamsEventEmittedResponse {
  profileId: BigNumberish;
  contentURI: string;
  pointedProfileId: BigNumberish;
  pointedPubId: BigNumberish;
  referrerProfileIds: BigNumberish[];
  referrerPubIds: BigNumberish[];
  referenceModuleData: Arrayish;
  actionModules: string[];
  actionModulesInitDatas: Arrayish[];
  referenceModule: string;
  referenceModuleInitData: Arrayish;
}
export interface CommentCreatedEventEmittedResponse {
  commentParams: CommentParamsEventEmittedResponse;
  pubId: BigNumberish;
  referenceModuleReturnData: Arrayish;
  actionModulesInitReturnDatas: Arrayish[];
  referenceModuleInitReturnData: Arrayish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface DelegatedExecutorsConfigAppliedEventEmittedResponse {
  delegatorProfileId: BigNumberish;
  configNumber: BigNumberish;
  timestamp: BigNumberish;
}
export interface DelegatedExecutorsConfigChangedEventEmittedResponse {
  delegatorProfileId: BigNumberish;
  configNumber: BigNumberish;
  delegatedExecutors: string[];
  approvals: boolean[];
  timestamp: BigNumberish;
}
export interface EmergencyAdminSetEventEmittedResponse {
  caller: string;
  oldEmergencyAdmin: string;
  newEmergencyAdmin: string;
  timestamp: BigNumberish;
}
export interface FollowModuleSetEventEmittedResponse {
  profileId: BigNumberish;
  followModule: string;
  followModuleInitData: Arrayish;
  followModuleReturnData: Arrayish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface FollowModuleWhitelistedEventEmittedResponse {
  followModule: string;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface FollowNFTDeployedEventEmittedResponse {
  profileId: BigNumberish;
  followNFT: string;
  timestamp: BigNumberish;
}
export interface FollowedEventEmittedResponse {
  followerProfileId: BigNumberish;
  idOfProfileFollowed: BigNumberish;
  followTokenIdAssigned: BigNumberish;
  followModuleData: Arrayish;
  processFollowModuleReturnData: Arrayish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface GovernanceSetEventEmittedResponse {
  caller: string;
  prevGovernance: string;
  newGovernance: string;
  timestamp: BigNumberish;
}
export interface MirrorParamsEventEmittedResponse {
  profileId: BigNumberish;
  metadataURI: string;
  pointedProfileId: BigNumberish;
  pointedPubId: BigNumberish;
  referrerProfileIds: BigNumberish[];
  referrerPubIds: BigNumberish[];
  referenceModuleData: Arrayish;
}
export interface MirrorCreatedEventEmittedResponse {
  mirrorParams: MirrorParamsEventEmittedResponse;
  pubId: BigNumberish;
  referenceModuleReturnData: Arrayish;
  transactionExecutor: string;
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
export interface PostParamsEventEmittedResponse {
  profileId: BigNumberish;
  contentURI: string;
  actionModules: string[];
  actionModulesInitDatas: Arrayish[];
  referenceModule: string;
  referenceModuleInitData: Arrayish;
}
export interface PostCreatedEventEmittedResponse {
  postParams: PostParamsEventEmittedResponse;
  pubId: BigNumberish;
  actionModulesInitReturnDatas: Arrayish[];
  referenceModuleInitReturnData: Arrayish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface ProfileCreatedEventEmittedResponse {
  profileId: BigNumberish;
  creator: string;
  to: string;
  timestamp: BigNumberish;
}
export interface ProfileCreatorWhitelistedEventEmittedResponse {
  profileCreator: string;
  whitelisted: boolean;
  timestamp: BigNumberish;
}
export interface ProfileMetadataSetEventEmittedResponse {
  profileId: BigNumberish;
  metadata: string;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface QuoteParamsEventEmittedResponse {
  profileId: BigNumberish;
  contentURI: string;
  pointedProfileId: BigNumberish;
  pointedPubId: BigNumberish;
  referrerProfileIds: BigNumberish[];
  referrerPubIds: BigNumberish[];
  referenceModuleData: Arrayish;
  actionModules: string[];
  actionModulesInitDatas: Arrayish[];
  referenceModule: string;
  referenceModuleInitData: Arrayish;
}
export interface QuoteCreatedEventEmittedResponse {
  quoteParams: QuoteParamsEventEmittedResponse;
  pubId: BigNumberish;
  referenceModuleReturnData: Arrayish;
  actionModulesInitReturnDatas: Arrayish[];
  referenceModuleInitReturnData: Arrayish;
  transactionExecutor: string;
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
export interface TokenGuardianStateChangedEventEmittedResponse {
  wallet: string;
  enabled: boolean;
  tokenGuardianDisablingTimestamp: BigNumberish;
  timestamp: BigNumberish;
}
export interface UnblockedEventEmittedResponse {
  byProfileId: BigNumberish;
  idOfProfileUnblocked: BigNumberish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface UnfollowedEventEmittedResponse {
  unfollowerProfileId: BigNumberish;
  idOfProfileUnfollowed: BigNumberish;
  transactionExecutor: string;
  timestamp: BigNumberish;
}
export interface NonceUpdatedEventEmittedResponse {
  signer: string;
  nonce: BigNumberish;
  timestamp: BigNumberish;
}
export interface LensUpgradeVersionEventEmittedResponse {
  implementation: string;
  version: string;
  gitCommit: Arrayish;
  timestamp: BigNumberish;
}
export interface CollectedLegacyEventEmittedResponse {
  publicationCollectedProfileId: BigNumberish;
  publicationCollectedId: BigNumberish;
  collectorProfileId: BigNumberish;
  transactionExecutor: string;
  referrerProfileId: BigNumberish;
  referrerPubId: BigNumberish;
  collectModule: string;
  collectModuleData: Arrayish;
  tokenId: BigNumberish;
  timestamp: BigNumberish;
}
export interface LensHubEvents {}
