import {
  Deployment,
  Environment,
  EthereumNode,
  MomokaValidatorError,
  TxValidatedResult,
} from '../..';
import { checkDAProof } from '../../client';
import { getParamOrExit } from '../../common/helpers';
import { PromiseWithContextResult } from '../../data-availability-models/da-result';
import {
  DAEventType,
  DAStructurePublication,
  PublicationTypedData,
} from '../../data-availability-models/publications/data-availability-structure-publication';
import * as getBundlrByIdAPIDefault from '../../input-output/bundlr/get-bundlr-by-id.api';
import * as database from '../../input-output/db';
import * as submittors from '../../submitters';
import { postCreatedDelegateArweaveResponse } from './post/post-created-delegate-arweave-response.mock';

export const mockGetTxDb = database.getTxDb as jest.MockedFunction<typeof database.getTxDb>;

export const mockhasSignatureBeenUsedBeforeDb =
  database.hasSignatureBeenUsedBeforeDb as jest.MockedFunction<
    typeof database.hasSignatureBeenUsedBeforeDb
  >;

export const mockGetDAPublicationByIdAPI =
  getBundlrByIdAPIDefault.getBundlrByIdAPI as jest.MockedFunction<
    typeof getBundlrByIdAPIDefault.getBundlrByIdAPI
  >;

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

export const mockGetSubmitters = submittors.getSubmitters as jest.MockedFunction<
  typeof submittors.getSubmitters
>;
mockGetSubmitters.mockImplementation(() => ['0x886Bb211aC324dAF3744b2AB0eF20C0aCf73eA59']);

export const mockIsValidSubmitter = submittors.isValidSubmitter as jest.MockedFunction<
  typeof submittors.isValidSubmitter
>;
mockIsValidSubmitter.mockImplementation(() => true);

const ethereumNode: EthereumNode = {
  environment: getParamOrExit('ETHEREUM_NETWORK') as Environment,
  nodeUrl: getParamOrExit('NODE_URL'),
  deployment: Deployment.STAGING,
};

export const callCheckDAProof = (): PromiseWithContextResult<
  void | DAStructurePublication<DAEventType, PublicationTypedData>,
  DAStructurePublication<DAEventType, PublicationTypedData>
> => {
  return checkDAProof('mocked_tx_id', ethereumNode, {
    log: jest.fn(),
    byPassDb: false,
    verifyPointer: true,
  });
};

export const checkAndValidateDAProof = async (
  expectedError: MomokaValidatorError
): Promise<void> => {
  const result = await callCheckDAProof();
  expect(result.isFailure()).toBe(true);
  if (result.isFailure()) {
    expect(result.failure).toEqual(expectedError);
  }
};

export const random = (): string => (Math.random() + 1).toString(36).substring(7);

export const mockTxValidationResult: TxValidatedResult = {
  success: true,
  proofTxId: random(),
  dataAvailabilityResult: postCreatedDelegateArweaveResponse,
};
