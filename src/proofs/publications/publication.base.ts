import { SignatureLike } from '@ethersproject/bytes';
import { utils } from 'ethers';
import { ClaimableValidatorError } from '../../data-availability-models/claimable-validator-errors';
import { failure, PromiseResult, success } from '../../data-availability-models/da-result';
import {
  TypedDataDomain,
  TypedDataField,
} from '../../data-availability-models/data-availability-typed-data';

/**
 * Verifies the provided signature corresponds to the given typed data and returns the address of the signer.
 * @param domain The typed data domain.
 * @param types The typed data types.
 * @param value The typed data value.
 * @param signature The signature to verify.
 * @returns A `success` result with the signer's address if the signature is valid, or a `failure` result with a `ClaimableValidatorError` if there's an error during the verification process.
            turned into a promise as its minimum CPU intensive
 */
export const whoSignedTypedData = (
  domain: TypedDataDomain,
  types: Record<string, Array<TypedDataField>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>,
  signature: SignatureLike
): PromiseResult<string> => {
  try {
    const address = utils.verifyTypedData(domain, types, value, signature);
    return Promise.resolve(success(address));
  } catch {
    return Promise.resolve(failure(ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA));
  }
};
