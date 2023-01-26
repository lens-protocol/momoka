import { SignatureLike } from '@ethersproject/bytes';
import { utils } from 'ethers';
import { ClaimableValidatorError } from '../claimable-validator-errors';
import { failure, Result, success } from '../da-result';
import {
  TypedDataDomain,
  TypedDataField,
} from '../data-availability-models/data-availability-typed-data';

export const whoSignedTypedData = (
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  value: Record<string, any>,
  signature: SignatureLike
): Result<string | void> => {
  try {
    const address = utils.verifyTypedData(domain, types, value, signature);
    return success(address);
  } catch {
    return failure(ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA);
  }
};
