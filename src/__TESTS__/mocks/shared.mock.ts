import { PromiseWithContextResult } from "../../data-availability-models/da-result";
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData
} from "../../data-availability-models/publications/data-availability-structure-publication";
import * as getBundlrByIdAPIDefault from "../../input-output/bundlr/get-bundlr-by-id.api";
import * as ethereumDefault from "../../evm/ethereum";
import * as getOwnerOfTransactionAPIDefault from "../../input-output/bundlr/get-owner-of-transaction.api";
import * as database from "../../input-output/db";
import * as submittors from "../../submitters";
import { postCreatedDelegateArweaveResponse } from "./post/post-created-delegate-arweave-response.mock";
import { when } from "jest-when";
import { TIMESTAMP_ID } from "./constants";
import { DATimestampProofsResponse } from "../../data-availability-models/data-availability-timestamp-proofs";
import { DaProofGateway } from "../../proofs/da-proof-gateway";
import { ClientDaProofVerifier } from "../../client/client-da-proof-verifier";
import { DaProofChecker } from "../../proofs/da-proof-checker";
import { EthereumNode } from "../../evm/ethereum";
import { Deployment, Environment } from "../../common/environment";
import { ClaimableValidatorError } from "../../data-availability-models/claimable-validator-errors";
import { TxValidatedResult } from "../../input-output/tx-validated-results";

export const mockGetTxDb = database.getTxDb as jest.MockedFunction<typeof database.getTxDb>;
mockGetTxDb.mockImplementation(() => Promise.resolve(null));

export const mockGetDAPublicationByIdAPI = jest.mocked(getBundlrByIdAPIDefault.getBundlrByIdAPI);

export const mockGetDATimestampProofsByIdAPI =
  when(getBundlrByIdAPIDefault.getBundlrByIdAPI<DATimestampProofsResponse>).calledWith(TIMESTAMP_ID, expect.anything())

const mockGetOwnerOfTimestampProofs =
  when(getOwnerOfTransactionAPIDefault.getOwnerOfTransactionAPI).calledWith(TIMESTAMP_ID, expect.anything())
mockGetOwnerOfTimestampProofs.mockImplementation(() => Promise.resolve("0x-fake-address"));

export const mockGetBlock = jest.mocked(ethereumDefault.getBlock);
export const mockGetOnChainProfileDetails = jest.mocked(ethereumDefault.getOnChainProfileDetails);

export const mockImpl__NO_SIGNATURE_SUBMITTER = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
): void => {
  mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
    return {
      ...baseMock,
      signature: undefined,
    };
  });
};

export const mockImpl__TIMESTAMP_PROOF_INVALID_SIGNATURE = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
): void => {
  mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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

export const mockImpl__TIMESTAMP_PROOF_NOT_SUBMITTER = (): void => {
  mockIsValidSubmitter.mockImplementationOnce(() => false);
};

export const mockImpl__INVALID_EVENT_TIMESTAMP = (
  baseMock: DAStructurePublication<DAEventType, PublicationTypedData>
): void => {
  mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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
  pointer: unknown
): void => {
  mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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
): void => {
  mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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
): void => {
  mockGetDAPublicationByIdAPI.mockImplementationOnce(async () => {
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

const ethereumNode: EthereumNode = {
  environment: Environment.MUMBAI,
  deployment: Deployment.PRODUCTION,
  nodeUrl: "fake",
};

export const callCheckDAProof = (txId: string): PromiseWithContextResult<
  void | DAStructurePublication<DAEventType, PublicationTypedData>,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  const gateway = new DaProofGateway();
  const verifier = new ClientDaProofVerifier();
  const checker = new DaProofChecker(verifier, gateway);

  return checker.checkDAProof(txId, ethereumNode, {
    log: jest.fn(),
    byPassDb: false,
    // Revert back to verify pointer
    verifyPointer: false,
  });
};

export const checkAndValidateDAProof = async (
  txId: string,
  expectedError: ClaimableValidatorError
): Promise<void> => {
  const result = await callCheckDAProof(txId);
  expect(result.isFailure()).toBe(true);
  if (result.isFailure()) {
    expect(result.failure).toEqual({ failure: expectedError });
  }
};

export const random = (): string => (Math.random() + 1).toString(36).substring(7);

export const mockTxValidationResult: TxValidatedResult = {
  success: true,
  proofTxId: random(),
  dataAvailabilityResult: postCreatedDelegateArweaveResponse,
};

export const generateRandomArweaveId = () => {
  return 'ar://random-id' + random();
}
