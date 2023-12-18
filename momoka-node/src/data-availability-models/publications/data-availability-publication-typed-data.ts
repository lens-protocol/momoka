import {
  EIP712TypedDataValueBase,
  TypedDataDomain,
  TypedDataField,
} from '../data-availability-typed-data';

interface CreatePostV1EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  contentURI: string;
  collectModule: string;
  collectModuleInitData: string;
  referenceModule: string;
  referenceModuleInitData: string;
}

interface CreatePostV2EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  contentURI: string;
  actionModules: string[];
  actionModulesInitDatas: string[];
  referenceModule: string;
  referenceModuleInitData: string;
}

export interface CreatePostV1EIP712TypedData {
  types: {
    PostWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreatePostV1EIP712TypedDataValue;
}

export interface CreatePostV2EIP712TypedData {
  types: {
    PostWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreatePostV2EIP712TypedDataValue;
}

interface CreateCommentV1EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  contentURI: string;
  profileIdPointed: string;
  pubIdPointed: string;
  referenceModule: string;
  collectModule: string;
  collectModuleInitData: string;
  referenceModuleInitData: string;
  referenceModuleData: string;
}

interface CreateCommentV2EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  contentURI: string;
  pointedProfileId: string;
  pointedPubId: string;
  referrerProfileIds: string[];
  referrerPubIds: string[];
  referenceModuleData: string;
  actionModules: string[];
  actionModulesInitDatas: string[];
  referenceModule: string;
  referenceModuleInitData: string;
}

export interface CreateCommentV1EIP712TypedData {
  types: {
    CommentWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreateCommentV1EIP712TypedDataValue;
}

export interface CreateCommentV2EIP712TypedData {
  types: {
    CommentWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreateCommentV2EIP712TypedDataValue;
}

export interface CreateMirrorV1EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  profileIdPointed: string;
  pubIdPointed: string;
  referenceModuleData: string;
  referenceModule: string;
  referenceModuleInitData: string;
}

export interface CreateMirrorV2EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  pointedProfileId: string;
  pointedPubId: string;
  referenceModuleData: string;
  metadataURI: string;
  referrerPubIds: string[];
  referrerProfileIds: string[];
}

export interface CreateMirrorV1EIP712TypedData {
  types: {
    MirrorWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreateMirrorV1EIP712TypedDataValue;
}

export interface CreateMirrorV2EIP712TypedData {
  types: {
    MirrorWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreateMirrorV2EIP712TypedDataValue;
}

interface CreatQuoteV2EIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  contentURI: string;
  pointedProfileId: string;
  pointedPubId: string;
  referrerProfileIds: string[];
  referrerPubIds: string[];
  referenceModuleData: string;
  actionModules: string[];
  actionModulesInitDatas: string[];
  referenceModule: string;
  referenceModuleInitData: string;
}

export interface CreateQuoteV2EIP712TypedData {
  types: {
    MirrorWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreatQuoteV2EIP712TypedDataValue;
}

export type PublicationV1TypedData =
  | CreatePostV1EIP712TypedData
  | CreateCommentV1EIP712TypedData
  | CreateMirrorV1EIP712TypedData;

export type PublicationV2TypedData =
  | CreatePostV2EIP712TypedData
  | CreateCommentV2EIP712TypedData
  | CreateMirrorV2EIP712TypedData
  | CreateQuoteV2EIP712TypedData;

export type PublicationTypedData = PublicationV1TypedData | PublicationV2TypedData;
