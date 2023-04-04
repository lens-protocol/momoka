// apply mocks!
jest.setTimeout(3000);
jest.mock('../input-output/db');
jest.mock('../input-output/arweave/get-arweave-by-id.api');
jest.mock('../submitters');

import { ClaimableValidatorError } from '..';
import { DAPublicationPointerType } from '../data-availability-models/publications/data-availability-structure-publication';
import { deepClone } from '../common/helpers';
import { commentCreatedDelegateArweaveResponse } from './mocks/comment/comment-created-delegate-arweave-response.mock';
import { commentCreatedWithoutDelegateArweaveResponse } from './mocks/comment/comment-created-without-delegate-arweave-response.mock';
import * as sharedMocks from './mocks/shared.mock';
import { mockTxValidationResult } from './mocks/shared.mock';

describe('comment', () => {
  describe('with delegate', () => {
    let baseMock = commentCreatedDelegateArweaveResponse;

    beforeEach(() => {
      baseMock = commentCreatedDelegateArweaveResponse;
      sharedMocks.mockGetBundlrByIdAPI.mockImplementation(async () =>
        deepClone(commentCreatedDelegateArweaveResponse)
      );
    });

    describe('should return success when', () => {
      test('signed by delegate is true', async () => {
        expect(baseMock.chainProofs.thisPublication.signedByDelegate).toBe(true);
      });

      test('txExists in the db already', async () => {
        sharedMocks.mockGetTxDb.mockImplementationOnce(async () => null);
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

      test('PUBLICATION_NO_POINTER', async () => {
        sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, null);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.PUBLICATION_NO_POINTER);
      });

      test('PUBLICATION_NONE_DA', async () => {
        sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, {
          type: DAPublicationPointerType.ON_EVM_CHAIN,
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.PUBLICATION_NONE_DA);
      });

      test('PUBLICATION_NONCE_INVALID', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
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
                    nonce: 13234452346523,
                  },
                },
              },
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.PUBLICATION_NONCE_INVALID
        );
      });

      xtest('PUBLICATION_SIGNER_NOT_ALLOWED', async () => {});

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

      test('EVENT_MISMATCH - profileIdPointed does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              profileIdPointed: '0x01',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - pubIdPointed does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              pubIdPointed: '0x01',
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
    let baseMock = commentCreatedWithoutDelegateArweaveResponse;

    beforeEach(() => {
      baseMock = commentCreatedWithoutDelegateArweaveResponse;
      sharedMocks.mockGetBundlrByIdAPI.mockImplementation(async () =>
        deepClone(commentCreatedWithoutDelegateArweaveResponse)
      );
    });

    describe('should return success when', () => {
      test('signed by delegate is false', async () => {
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

      test('PUBLICATION_NO_POINTER', async () => {
        sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, null);

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.PUBLICATION_NO_POINTER);
      });

      test('PUBLICATION_NONE_DA', async () => {
        sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, {
          type: DAPublicationPointerType.ON_EVM_CHAIN,
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.PUBLICATION_NONE_DA);
      });

      test('PUBLICATION_NONCE_INVALID', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
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
                    nonce: 13234452346523,
                  },
                },
              },
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(
          ClaimableValidatorError.PUBLICATION_NONCE_INVALID
        );
      });

      xtest('PUBLICATION_SIGNER_NOT_ALLOWED', async () => {});

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

      test('EVENT_MISMATCH - profileIdPointed does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              profileIdPointed: '0x01',
            },
          };
        });

        await sharedMocks.checkAndValidateDAProof(ClaimableValidatorError.EVENT_MISMATCH);
      });

      test('EVENT_MISMATCH - pubIdPointed does not match typed data', async () => {
        sharedMocks.mockGetBundlrByIdAPI.mockImplementationOnce(async () => {
          return {
            ...baseMock,
            event: {
              ...baseMock.event,
              pubIdPointed: '0x01',
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
