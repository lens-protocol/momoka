// apply mocks!
jest.setTimeout(30000);
jest.mock('../input-output/db');
jest.mock('../input-output/arweave/get-arweave-by-id.api');
jest.mock('../submitters');

import { deepClone } from '../common/helpers';
import { ClaimableValidatorError } from '../data-availability-models/claimable-validator-errors';
import { postCreatedDelegateArweaveResponse } from './mocks/post/post-created-delegate-arweave-response.mock';
import { postCreatedWithoutDelegateArweaveResponse } from './mocks/post/post-created-without-delegate-arweave-response.mock';
import * as sharedMocks from './mocks/shared.mock';
import { mockTxValidationResult } from './mocks/shared.mock';

describe('post', () => {
  describe('with delegate', () => {
    let baseMock = postCreatedDelegateArweaveResponse;

    beforeEach(() => {
      baseMock = postCreatedDelegateArweaveResponse;
      sharedMocks.mockGetBundlrByIdAPI.mockImplementation(async () =>
        deepClone(postCreatedDelegateArweaveResponse)
      );
    });

    describe('should return success when', () => {
      test('signed by delegate is true', async () => {
        expect(baseMock.chainProofs.thisPublication.signedByDelegate).toBe(true);
      });

      test('txExists in the db already', async () => {
        sharedMocks.mockGetTxDb.mockImplementationOnce(async () => mockTxValidationResult);
        const result = await sharedMocks.callCheckDAProof();
        expect(result.isSuccess()).toBe(true);
      });

      test('tx is valid and passes all the simulation checks', async () => {
        const result = await sharedMocks.callCheckDAProof();
        expect(result.isSuccess()).toBe(true);
      });
    });

    describe('should return failure when', () => {
      test('NO_SIGNATURE_SUBMITTER', async () => {
        sharedMocks.mockImpl__NO_SIGNATURE_SUBMITTER(baseMock);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
      });

      test('INVALID_SIGNATURE_SUBMITTER', async () => {
        sharedMocks.mockIsValidSubmitter.mockImplementationOnce(() => false);

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER
        );
      });

      test('TIMESTAMP_PROOF_INVALID_SIGNATURE', async () => {
        sharedMocks.mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE(baseMock);

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
        );
      });

      test('TIMESTAMP_PROOF_NOT_SUBMITTER', async () => {
        sharedMocks.mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER();

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER
        );
      });

      test('INVALID_EVENT_TIMESTAMP', async () => {
        sharedMocks.mockImpl__INVALID_EVENT_TIMESTAMP(baseMock);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.INVALID_EVENT_TIMESTAMP);
      });

      xtest('NOT_CLOSEST_BLOCK', async () => {
        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.NOT_CLOSEST_BLOCK);
      });

      test('INVALID_POINTER_SET_NOT_NEEDED', async () => {
        sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, 'mocked');

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED
        );
      });

      test('SIMULATION_FAILED - trying to submit a tx with a profile id not owned', async () => {
        sharedMocks.mockImpl__SIMULATION_FAILED_BAD_PROFILE_ID(baseMock);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.SIMULATION_FAILED);
      });

      test('INVALID_FORMATTED_TYPED_DATA', async () => {
        sharedMocks.mockImpl__INVALID_FORMATTED_TYPED_DATA(baseMock);

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA
        );
      });

      test('EVENT_MISMATCH - pub id does not match simulated result', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              pubId: '0x000000000000002',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - profile id does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              profileId: '0x02',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - contentURI does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              contentURI: '__mocked_content_uri__',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - collectModule does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              collectModule: '0x0000000000000000000000000000000000000',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - collectModuleReturnData is not empty bytes', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              collectModuleReturnData: 'not_empty_bytes',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - referenceModule does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              referenceModule: '0x0000000000000000000000000000000000001',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - referenceModuleReturnData is not empty bytes', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              referenceModuleReturnData: 'not_empty_bytes',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      xtest('SIMULATION_NODE_COULD_NOT_RUN', async () => {});

      xtest('UNKNOWN', () => {});
    });
  });

  describe('without delegate', () => {
    let baseMock = postCreatedWithoutDelegateArweaveResponse;

    beforeEach(() => {
      baseMock = postCreatedWithoutDelegateArweaveResponse;
      sharedMocks.mockGetBundlrByIdAPI.mockImplementation(async () =>
        deepClone(postCreatedWithoutDelegateArweaveResponse)
      );
    });

    describe('should return success when', () => {
      test('signed by delegate is false', () => {
        expect(baseMock.chainProofs.thisPublication.signedByDelegate).toBe(false);
      });

      test('txExists in the db already', async () => {
        sharedMocks.mockGetTxDb.mockImplementationOnce(async () => mockTxValidationResult);
        const result = await sharedMocks.callCheckDAProof();
        expect(result.isSuccess()).toBe(true);
      });

      test('tx is valid and passes all the simulation checks', async () => {
        const result = await sharedMocks.callCheckDAProof();
        expect(result.isSuccess()).toBe(true);
      });
    });

    describe('should return failure when', () => {
      test('NO_SIGNATURE_SUBMITTER', async () => {
        sharedMocks.mockImpl__NO_SIGNATURE_SUBMITTER(baseMock);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
      });

      test('INVALID_SIGNATURE_SUBMITTER', async () => {
        sharedMocks.mockIsValidSubmitter.mockImplementationOnce(() => false);

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER
        );
      });

      test('TIMESTAMP_PROOF_INVALID_SIGNATURE', async () => {
        sharedMocks.mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE(baseMock);

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
        );
      });

      test('TIMESTAMP_PROOF_NOT_SUBMITTER', async () => {
        sharedMocks.mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER();

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER
        );
      });

      test('INVALID_EVENT_TIMESTAMP', async () => {
        sharedMocks.mockImpl__INVALID_EVENT_TIMESTAMP(baseMock);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.INVALID_EVENT_TIMESTAMP);
      });

      xtest('NOT_CLOSEST_BLOCK', async () => {
        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.NOT_CLOSEST_BLOCK);
      });

      test('INVALID_POINTER_SET_NOT_NEEDED', async () => {
        sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, 'mocked');

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED
        );
      });

      test('SIMULATION_FAILED - trying to submit a tx with a profile id not owned', async () => {
        sharedMocks.mockImpl__SIMULATION_FAILED_BAD_PROFILE_ID(baseMock);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.SIMULATION_FAILED);
      });

      test('INVALID_FORMATTED_TYPED_DATA', async () => {
        sharedMocks.mockImpl__INVALID_FORMATTED_TYPED_DATA(baseMock);

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA
        );
      });

      test('EVENT_MISMATCH - pub id does not match simulated result', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              pubId: '0x000000000000002',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - profile id does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              profileId: '0x02',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - contentURI does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              contentURI: '__mocked_content_uri__',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - collectModule does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              collectModule: '0x0000000000000000000000000000000000000',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - collectModuleReturnData is not empty bytes', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              collectModuleReturnData: 'not_empty_bytes',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - referenceModule does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              referenceModule: '0x0000000000000000000000000000000000001',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - referenceModuleReturnData is not empty bytes', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              referenceModuleReturnData: 'not_empty_bytes',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      xtest('SIMULATION_NODE_COULD_NOT_RUN', async () => {});

      xtest('UNKNOWN', () => {});
    });
  });
});
