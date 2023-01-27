import { checkDAProof } from '../../';
import * as getArweaveByIdAPIDefault from '../../arweave/get-arweave-by-id.api';
import { ClaimableValidatorError } from '../../claimable-validator-errors';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../../data-availability-models/publications/data-availability-structure-publication';
import * as database from '../../db';
import * as submittors from '../../submitters';

export const mockTxExistsDb = database.txExistsDb as jest.MockedFunction<
  typeof database.txExistsDb
>;
mockTxExistsDb.mockImplementation(async () => false);

export const mockGetArweaveByIdAPI =
  getArweaveByIdAPIDefault.getArweaveByIdAPI as jest.MockedFunction<
    typeof getArweaveByIdAPIDefault.getArweaveByIdAPI
  >;

export const mockImpl__NO_SIGNATURE_SUBMITTER = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
) => {
  mockGetArweaveByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      signature: undefined,
    };
  });
};

export const mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
) => {
  mockGetArweaveByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      timestampProofs: {
        response: {
          ...baseMock.timestampProofs.response,
          timestamp: 123456789,
        },
      },
    };
  });
};

export const mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER = () => {
  mockIsValidTransactionSubmitter.mockImplementationOnce(() => Promise.resolve(false));
};

export const mockImpl__INVALID_EVENT_TIMESTAMP = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
) => {
  mockGetArweaveByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      event: {
        ...baseMock.event,
        timestamp: 111,
      },
    };
  });
};

export const mockImpl__INVALID_POINTER_SET = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>,
  pointer: any
) => {
  mockGetArweaveByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      chainProofs: {
        ...baseMock.chainProofs,
        pointer: pointer,
      },
    };
  });
};

export const mockImpl__SIMULATION_FAILED_BAD_PROFILE_ID = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
) => {
  mockGetArweaveByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      chainProofs: {
        ...baseMock.chainProofs,
        thisPublication: {
          ...baseMock.chainProofs.thisPublication,
          typedData: {
            ...baseMock.chainProofs.thisPublication.typedData,
            value: {
              ...baseMock.chainProofs.thisPublication.typedData.value,
              profileId: '0x02',
            },
          },
        },
      },
    };
  });
};

export const mockImpl__INVALID_FORMATTED_TYPED_DATA = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
) => {
  mockGetArweaveByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      chainProofs: {
        ...baseMock.chainProofs,
        thisPublication: {
          ...baseMock.chainProofs.thisPublication,
          typedData: {
            ...baseMock.chainProofs.thisPublication.typedData,
            value: {
              ...baseMock.chainProofs.thisPublication.typedData.value,
              referenceModule: '0x0000000000000000000000000000000000000',
            },
          },
        },
      },
    };
  });
};

export const mockIsValidSubmitter = submittors.isValidSubmitter as jest.MockedFunction<
  typeof submittors.isValidSubmitter
>;
mockIsValidSubmitter.mockImplementation(() => true);

export const mockIsValidTransactionSubmitter =
  submittors.isValidTransactionSubmitter as jest.MockedFunction<
    typeof submittors.isValidTransactionSubmitter
  >;
mockIsValidTransactionSubmitter.mockImplementation(() => Promise.resolve(true));

export const callCheckDAProof = () => {
  return checkDAProof('mocked_tx_id', { log: console.log, verifyPointer: true });
};

export const checkAndValidateDAProof = async (expectedError: ClaimableValidatorError) => {
  const result = await callCheckDAProof();
  expect(result.failure).toEqual(expectedError);
  expect(result.isFailure()).toBe(true);
};

export const random = () => (Math.random() + 1).toString(36).substring(7);
