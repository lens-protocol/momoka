import {
  EIP712TypedDataValueBase,
  TypedDataDomain,
  TypedDataField,
} from '../data-availability-typed-data';

interface CreatePostEIP712TypedDataValue extends EIP712TypedDataValueBase {
  profileId: string;
  contentURI: string;
  collectModule: string;
  collectModuleInitData: string;
  referenceModule: string;
  referenceModuleInitData: string;
}

export interface CreatePostEIP712TypedData {
  types: {
    PostWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreatePostEIP712TypedDataValue;
}

interface CreateCommentEIP712TypedDataValue extends EIP712TypedDataValueBase {
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

export interface CreateCommentEIP712TypedData {
  types: {
    CommentWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreateCommentEIP712TypedDataValue;
}

export interface CreateMirrorEIP712TypedDataValue
  extends EIP712TypedDataValueBase {
  profileId: string;
  profileIdPointed: string;
  pubIdPointed: string;
  referenceModuleData: string;
  referenceModule: string;
  referenceModuleInitData: string;
}

export interface CreateMirrorEIP712TypedData {
  types: {
    MirrorWithSig: Array<TypedDataField>;
  };
  domain: TypedDataDomain;
  value: CreateMirrorEIP712TypedDataValue;
}
