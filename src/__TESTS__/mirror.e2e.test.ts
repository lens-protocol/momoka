// apply mocks!

import {
  postCreatedDelegateArweaveResponse,
  postTimestampProofsBundlrResponse
} from "./mocks/post/post-created-delegate-arweave-response.mock";

jest.setTimeout(30000);
jest.mock('../input-output/db');
jest.mock('../input-output/bundlr/get-bundlr-by-id.api');
jest.mock('../input-output/bundlr/get-owner-of-transaction.api');
jest.mock('../evm/ethereum');
jest.mock('../submitters');

import { when } from "jest-when";
import { BigNumber } from "ethers";

import { success } from "../data-availability-models/da-result";
import { DAPublicationPointerType } from '../data-availability-models/publications/data-availability-structure-publication';
import { deepClone } from '../common/helpers';
import { mirrorCreatedDelegateCommentArweaveResponse } from './mocks/mirror/mirror-created-delegate-comment-arweave-response.mock';
import {
  mirrorCreatedDelegatePostArweaveResponse,
  mirrorTimestampProofsBundlrResponse
} from "./mocks/mirror/mirror-created-delegate-post-arweave-response.mock";
import { mirrorCreatedWithoutDelegateCommentArweaveResponse } from './mocks/mirror/mirror-created-without-delegate-comment-arweave-response.mock';
import { mirrorCreatedWithoutDelegatePostArweaveResponse } from './mocks/mirror/mirror-created-without-delegate-post-arweave-response.mock';
import * as sharedMocks from './mocks/shared.mock';
import {
  generateRandomArweaveId,
  mockGetOnChainProfileDetails,
  mockTxValidationResult
} from "./mocks/shared.mock";
import { ClaimableValidatorError } from "../data-availability-models/claimable-validator-errors";

const TX_ID = generateRandomArweaveId();

describe('mirror', () => {
  describe('post', () => {
    describe('with delegate', () => {
      let daPublicationBaseMock = mirrorCreatedDelegatePostArweaveResponse;
      // let timestampProofsBaseMock = mirrorTimestampProofsBundlrResponse;

      beforeEach(() => {
        daPublicationBaseMock = mirrorCreatedDelegatePostArweaveResponse;

        when(sharedMocks.mockGetDAPublicationByIdAPI)
          .calledWith(TX_ID.replace('ar://', ''), expect.anything())
          .mockImplementation(async () => deepClone(mirrorCreatedDelegatePostArweaveResponse));

        when(sharedMocks.mockGetDAPublicationByIdAPI)
          .calledWith(mirrorCreatedDelegatePostArweaveResponse.chainProofs.pointer!.location.replace('ar://', ''), expect.anything())
          .mockImplementation(async () => deepClone(postCreatedDelegateArweaveResponse));

        // TODO: Replace all `mockImplementationOnce` with `when` and `calledWith`

        // timestampProofsBaseMock = mirrorTimestampProofsBundlrResponse;
        sharedMocks.mockGetDATimestampProofsByIdAPI
          .mockImplementationOnce(async () =>
            deepClone(mirrorTimestampProofsBundlrResponse)
          ).
          mockImplementationOnce(async () => deepClone(postTimestampProofsBundlrResponse));

        const mirrorBlockNumber = mirrorCreatedDelegatePostArweaveResponse.chainProofs.thisPublication.blockNumber;
        const mirrorBlockResult = {
          number: mirrorBlockNumber,
          timestamp: mirrorCreatedDelegatePostArweaveResponse.chainProofs.thisPublication.blockTimestamp,
        };
        when(sharedMocks.mockGetBlock).calledWith(mirrorBlockNumber - 1, expect.anything()).mockImplementationOnce(async () => mirrorBlockResult)
        when(sharedMocks.mockGetBlock).calledWith(mirrorBlockNumber, expect.anything()).mockImplementationOnce(async () => mirrorBlockResult)
        when(sharedMocks.mockGetBlock).calledWith(mirrorBlockNumber + 1, expect.anything()).mockImplementationOnce(async () => mirrorBlockResult)

        const postBlockNumber = postCreatedDelegateArweaveResponse.chainProofs.thisPublication.blockNumber;
        const postBlockResult = {
          number: postBlockNumber,
          timestamp: postCreatedDelegateArweaveResponse.chainProofs.thisPublication.blockTimestamp,
        };
        when(sharedMocks.mockGetBlock).calledWith(postBlockNumber - 1, expect.anything()).mockImplementationOnce(async () => postBlockResult)
        when(sharedMocks.mockGetBlock).calledWith(postBlockNumber, expect.anything()).mockImplementationOnce(async () => postBlockResult)
        when(sharedMocks.mockGetBlock).calledWith(postBlockNumber + 1, expect.anything()).mockImplementationOnce(async () => postBlockResult)

        mockGetOnChainProfileDetails.mockImplementationOnce(async (_1, _2, signedBy: string) => success({
          sigNonce: mirrorCreatedDelegatePostArweaveResponse.chainProofs.thisPublication.typedData.value.nonce,
          currentPublicationId: BigNumber.from(mirrorCreatedDelegatePostArweaveResponse.event.pubId).sub(1).toHexString(),
          dispatcherAddress: signedBy,
          ownerOfAddress: signedBy,
        })).mockImplementationOnce(async (_1, _2, signedBy: string) => success({
          sigNonce: postCreatedDelegateArweaveResponse.chainProofs.thisPublication.typedData.value.nonce,
          currentPublicationId: BigNumber.from(postCreatedDelegateArweaveResponse.event.pubId).sub(1).toHexString(),
          dispatcherAddress: signedBy,
          ownerOfAddress: signedBy,
        }))
      });

      describe('should return success when', () => {
        test('signed by delegate is true', () => {
          expect(daPublicationBaseMock.chainProofs.thisPublication.signedByDelegate).toBe(true);
        });

        test('txExists in the db already', async () => {
          sharedMocks.mockGetTxDb.mockImplementationOnce(async () => mockTxValidationResult);
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });

        test.only('tx is valid and passes all the simulation checks', async () => {
          const result = await sharedMocks.callCheckDAProof(TX_ID);

          console.log(result);

          expect(result.isSuccess()).toBe(true);
        });
      });

      describe('should return failure when', () => {
        test('NO_SIGNATURE_SUBMITTER', async () => {
          sharedMocks.mockImpl__NO_SIGNATURE_SUBMITTER(daPublicationBaseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
        });

        test('INVALID_SIGNATURE_SUBMITTER', async () => {
          // sharedMocks.mockIsValidSubmitter.mockImplementationOnce(() => false);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER
          );
        });

        test('TIMESTAMP_PROOF_INVALID_SIGNATURE', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE(daPublicationBaseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
          );
        });

        test('TIMESTAMP_PROOF_NOT_SUBMITTER', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER();

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER
          );
        });

        test('INVALID_EVENT_TIMESTAMP', async () => {
          sharedMocks.mockImpl__INVALID_EVENT_TIMESTAMP(daPublicationBaseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_EVENT_TIMESTAMP
          );
        });

        xtest('NOT_CLOSEST_BLOCK', async () => {
          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.NOT_CLOSEST_BLOCK);
        });

        test('PUBLICATION_NO_POINTER', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(daPublicationBaseMock, null);

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.PUBLICATION_NO_POINTER);
        });

        test('PUBLICATION_NONE_DA', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(daPublicationBaseMock, {
            type: DAPublicationPointerType.ON_EVM_CHAIN,
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.PUBLICATION_NONE_DA);
        });

        test('PUBLICATION_NONCE_INVALID', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              chainProofs: {
                ...daPublicationBaseMock.chainProofs,
                thisPublication: {
                  ...daPublicationBaseMock.chainProofs.thisPublication,
                  typedData: {
                    ...daPublicationBaseMock.chainProofs.thisPublication.typedData,
                    value: {
                      ...daPublicationBaseMock.chainProofs.thisPublication.typedData.value,
                      nonce: 13234452346523,
                    },
                  },
                },
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.PUBLICATION_NONCE_INVALID
          );
        });

        xtest('PUBLICATION_SIGNER_NOT_ALLOWED', async () => {});

        test('INVALID_FORMATTED_TYPED_DATA', async () => {
          sharedMocks.mockImpl__INVALID_FORMATTED_TYPED_DATA(daPublicationBaseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA
          );
        });

        test('EVENT_MISMATCH - pub id does not match simulated result', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              event: {
                ...daPublicationBaseMock.event,
                pubId: '0x000000000000002',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profile id does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              event: {
                ...daPublicationBaseMock.event,
                profileId: '0x02',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profileIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              event: {
                ...daPublicationBaseMock.event,
                profileIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - pubIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              event: {
                ...daPublicationBaseMock.event,
                pubIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModule does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              event: {
                ...daPublicationBaseMock.event,
                referenceModule: '0x0000000000000000000000000000000000001',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModuleReturnData is not empty bytes', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...daPublicationBaseMock,
              event: {
                ...daPublicationBaseMock.event,
                referenceModuleReturnData: 'not_empty_bytes',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        xtest('SIMULATION_NODE_COULD_NOT_RUN', async () => {});

        xtest('INVALID_POINTER_SET_NOT_NEEDED', () => {});

        xtest('UNKNOWN', () => {});
      });
    });

    describe('without delegate', () => {
      let baseMock = mirrorCreatedWithoutDelegatePostArweaveResponse;

      beforeEach(() => {
        baseMock = mirrorCreatedWithoutDelegatePostArweaveResponse;
        sharedMocks.mockGetDAPublicationByIdAPI.mockImplementation(async () =>
          deepClone(mirrorCreatedWithoutDelegatePostArweaveResponse)
        );
      });

      describe('should return success when', () => {
        test('signed by delegate is false', async () => {
          expect(baseMock.chainProofs.thisPublication.signedByDelegate).toBe(false);
        });

        test('txExists in the db already', async () => {
          sharedMocks.mockGetTxDb.mockImplementationOnce(async () => mockTxValidationResult);
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });

        test('tx is valid and passes all the simulation checks', async () => {
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });
      });

      describe('should return failure when', () => {
        test('NO_SIGNATURE_SUBMITTER', async () => {
          sharedMocks.mockImpl__NO_SIGNATURE_SUBMITTER(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
        });

        test('INVALID_SIGNATURE_SUBMITTER', async () => {
          // sharedMocks.mockIsValidSubmitter.mockImplementationOnce(() => false);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER
          );
        });

        test('TIMESTAMP_PROOF_INVALID_SIGNATURE', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
          );
        });

        test('TIMESTAMP_PROOF_NOT_SUBMITTER', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER();

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER
          );
        });

        test('INVALID_EVENT_TIMESTAMP', async () => {
          sharedMocks.mockImpl__INVALID_EVENT_TIMESTAMP(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_EVENT_TIMESTAMP
          );
        });

        xtest('NOT_CLOSEST_BLOCK', async () => {
          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.NOT_CLOSEST_BLOCK);
        });

        test('PUBLICATION_NO_POINTER', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, null);

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.PUBLICATION_NO_POINTER);
        });

        test('PUBLICATION_NONE_DA', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, {
            type: DAPublicationPointerType.ON_EVM_CHAIN,
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.PUBLICATION_NONE_DA);
        });

        test('PUBLICATION_NONCE_INVALID', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.PUBLICATION_NONCE_INVALID
          );
        });

        xtest('PUBLICATION_SIGNER_NOT_ALLOWED', async () => {});

        test('INVALID_FORMATTED_TYPED_DATA', async () => {
          sharedMocks.mockImpl__INVALID_FORMATTED_TYPED_DATA(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA
          );
        });

        test('EVENT_MISMATCH - pub id does not match simulated result', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                pubId: '0x000000000000002',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profile id does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                profileId: '0x02',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profileIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                profileIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - pubIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                pubIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModule does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                referenceModule: '0x0000000000000000000000000000000000001',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID, ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModuleReturnData is not empty bytes', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                referenceModuleReturnData: 'not_empty_bytes',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        xtest('SIMULATION_NODE_COULD_NOT_RUN', async () => {});

        xtest('INVALID_POINTER_SET_NOT_NEEDED', () => {});

        xtest('UNKNOWN', () => {});
      });
    });
  });

  describe('comment', () => {
    describe('with delegate', () => {
      let baseMock = mirrorCreatedDelegateCommentArweaveResponse;

      beforeEach(() => {
        baseMock = mirrorCreatedDelegateCommentArweaveResponse;
        sharedMocks.mockGetDAPublicationByIdAPI.mockImplementation(async () =>
          deepClone(mirrorCreatedDelegateCommentArweaveResponse)
        );
      });

      describe('should return success when', () => {
        test('signed by delegate is true', async () => {
          expect(baseMock.chainProofs.thisPublication.signedByDelegate).toBe(true);
        });

        test('txExists in the db already', async () => {
          sharedMocks.mockGetTxDb.mockImplementationOnce(async () => mockTxValidationResult);
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });

        test('tx is valid and passes all the simulation checks', async () => {
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });
      });

      describe('should return failure when', () => {
        test('NO_SIGNATURE_SUBMITTER', async () => {
          sharedMocks.mockImpl__NO_SIGNATURE_SUBMITTER(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
        });

        test('INVALID_SIGNATURE_SUBMITTER', async () => {
          // sharedMocks.mockIsValidSubmitter.mockImplementationOnce(() => false);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER
          );
        });

        test('TIMESTAMP_PROOF_INVALID_SIGNATURE', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
          );
        });

        test('TIMESTAMP_PROOF_NOT_SUBMITTER', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER();

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER
          );
        });

        test('INVALID_EVENT_TIMESTAMP', async () => {
          sharedMocks.mockImpl__INVALID_EVENT_TIMESTAMP(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_EVENT_TIMESTAMP
          );
        });

        xtest('NOT_CLOSEST_BLOCK', async () => {
          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.NOT_CLOSEST_BLOCK);
        });

        test('PUBLICATION_NO_POINTER', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, null);

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.PUBLICATION_NO_POINTER);
        });

        test('PUBLICATION_NONE_DA', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, {
            type: DAPublicationPointerType.ON_EVM_CHAIN,
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.PUBLICATION_NONE_DA);
        });

        test('PUBLICATION_NONCE_INVALID', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.PUBLICATION_NONCE_INVALID
          );
        });

        xtest('PUBLICATION_SIGNER_NOT_ALLOWED', async () => {});

        test('INVALID_FORMATTED_TYPED_DATA', async () => {
          sharedMocks.mockImpl__INVALID_FORMATTED_TYPED_DATA(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA
          );
        });

        test('EVENT_MISMATCH - pub id does not match simulated result', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                pubId: '0x000000000000002',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profile id does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                profileId: '0x02',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profileIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                profileIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - pubIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                pubIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModule does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                referenceModule: '0x0000000000000000000000000000000000001',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModuleReturnData is not empty bytes', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                referenceModuleReturnData: 'not_empty_bytes',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        xtest('SIMULATION_NODE_COULD_NOT_RUN', async () => {});

        xtest('INVALID_POINTER_SET_NOT_NEEDED', () => {});

        xtest('UNKNOWN', () => {});
      });
    });

    describe('without delegate', () => {
      let baseMock = mirrorCreatedWithoutDelegateCommentArweaveResponse;

      beforeEach(() => {
        baseMock = mirrorCreatedWithoutDelegateCommentArweaveResponse;
        sharedMocks.mockGetDAPublicationByIdAPI.mockImplementation(async () =>
          deepClone(mirrorCreatedWithoutDelegateCommentArweaveResponse)
        );
      });

      describe('should return success when', () => {
        test('signed by delegate is false', async () => {
          expect(baseMock.chainProofs.thisPublication.signedByDelegate).toBe(false);
        });

        test('txExists in the db already', async () => {
          sharedMocks.mockGetTxDb.mockImplementationOnce(async () => mockTxValidationResult);
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });

        test('tx is valid and passes all the simulation checks', async () => {
          const result = await sharedMocks.callCheckDAProof(TX_ID);
          expect(result.isSuccess()).toBe(true);
        });
      });

      describe('should return failure when', () => {
        test('NO_SIGNATURE_SUBMITTER', async () => {
          sharedMocks.mockImpl__NO_SIGNATURE_SUBMITTER(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.NO_SIGNATURE_SUBMITTER);
        });

        test('INVALID_SIGNATURE_SUBMITTER', async () => {
          // sharedMocks.mockIsValidSubmitter.mockImplementationOnce(() => false);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER
          );
        });

        test('TIMESTAMP_PROOF_INVALID_SIGNATURE', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE
          );
        });

        test('TIMESTAMP_PROOF_NOT_SUBMITTER', async () => {
          sharedMocks.mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER();

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.TIMESTAMP_PROOF_NOT_SUBMITTER
          );
        });

        test('INVALID_EVENT_TIMESTAMP', async () => {
          sharedMocks.mockImpl__INVALID_EVENT_TIMESTAMP(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_EVENT_TIMESTAMP
          );
        });

        xtest('NOT_CLOSEST_BLOCK', async () => {
          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.NOT_CLOSEST_BLOCK);
        });

        test('PUBLICATION_NO_POINTER', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, null);

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.PUBLICATION_NO_POINTER);
        });

        test('PUBLICATION_NONE_DA', async () => {
          sharedMocks.mockImpl__INVALID_POINTER_SET(baseMock, {
            type: DAPublicationPointerType.ON_EVM_CHAIN,
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.PUBLICATION_NONE_DA);
        });

        test('PUBLICATION_NONCE_INVALID', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.PUBLICATION_NONCE_INVALID
          );
        });

        xtest('PUBLICATION_SIGNER_NOT_ALLOWED', async () => {});

        test('INVALID_FORMATTED_TYPED_DATA', async () => {
          sharedMocks.mockImpl__INVALID_FORMATTED_TYPED_DATA(baseMock);

          await sharedMocks.checkAndValidateDAProof(TX_ID,
            ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA
          );
        });

        test('EVENT_MISMATCH - pub id does not match simulated result', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                pubId: '0x000000000000002',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profile id does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                profileId: '0x02',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - profileIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                profileIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - pubIdPointed does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                pubIdPointed: '0x01',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModule does not match typed data', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                referenceModule: '0x0000000000000000000000000000000000001',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        test('EVENT_MISMATCH - referenceModuleReturnData is not empty bytes', async () => {
          sharedMocks.mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
            return {
              ...baseMock,
              event: {
                ...baseMock.event,
                referenceModuleReturnData: 'not_empty_bytes',
              },
            };
          });

          await sharedMocks.checkAndValidateDAProof(TX_ID,ClaimableValidatorError.EVENT_MISMATCH);
        });

        xtest('SIMULATION_NODE_COULD_NOT_RUN', async () => {});

        xtest('INVALID_POINTER_SET_NOT_NEEDED', () => {});

        xtest('UNKNOWN', () => {});
      });
    });
  });
});
