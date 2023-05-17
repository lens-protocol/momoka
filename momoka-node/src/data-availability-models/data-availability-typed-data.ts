export interface TypedDataField {
  name: string;
  type: string;
}

export interface TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface EIP712TypedDataValueBase {
  nonce: number;
  deadline: number;
}
