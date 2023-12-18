import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { DAProvider } from '../../../data-availability-models/data-availability-provider';
import { CreateMirrorV1EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';

export const mirrorCreatedWithoutDelegatePostArweaveResponse: DAStructurePublication<
  DAMirrorCreatedEventEmittedResponse,
  CreateMirrorV1EIP712TypedData
> = {
  signature:
    '0x1683ef107f09a291ebbe8f4bfc4f628ff9be10f661d0d18048c31a8b1ca981d948ef12c591e5d762e952bc287e57838b031a6451f2b8a58cfc5cedb565c742661b',
  dataAvailabilityId: '538ca9c4-682b-41d2-9b8a-52ede43728d7',
  type: DAActionTypes.MIRROR_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'zdkCXuVzawg3KipWCRVK2fo-yIUoj5IMuIYyFPGA55o',
      timestamp: 1674748125246,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'IJjhzO0D4ioq9Gc0mghnxvOIkrZdmrqkc_UpMkL9R-qulzvkZ_LY4QRQxP-rNAm-ZIoN3Jep9zefjTaRRvU6mhc6hKZaMWC4XvWW_IXl5TZH1eOfq0JENjoRoZ75IdwicJXtc9c7obeNs84hXqlNHJXUoQfC2mEjkqiRpK_Vz43Hxn-3ZkrNvNEM1cpbl5hJU3UP0iCQnJQPiTgiojnhTBgRoIEpLQBFdoF1IRXUH4J4TBCMoX5MzG5PUj_FJkJiYX_SM0iaiDi0y-6-IsvOu1o32UWVgmDa-PbTrd6kGuDdd3Ys4HHyjGbS4NGkbu-coMW7RdkCegowgrXvzDoVxG0pVKoMK7ndOfZJJlud3jonqcDDI0vESSVdt_DDMOjkqdHiyWdVWcDlS0TnToIdwuOgaHDgpoqFjPUd5GwE40QFix6QflbxfcFqleru9eDY4_hufxMYEWK3DiSN6QIe6jQg6-9ZLFvD4Chr_bxL48UkfwDx-Y7EZo5tb6uzwzEqAfXEb5ITyzVrEgo1sXEDKKkkNQ7C5Hq2mryWKRXHUtXkKErI1P_bNRp2GXumO30uwZfpsMcAtFPCsPMnm1j4aqhFjcpVk9HpFPa6DcCuX6U8T3MODbJbNPxFc_Pdt5wcLo6EcLEnnQTIvQEIj_aQvh__rh79d6XHckI1TL-9gAM',
      deadlineHeight: 1106621,
      block: 1106621,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x59cb0d34ef20e93e4073cadec0d05eb8ef9a6af4b55d7ddea099666f83509d193e554c4149856ddb36ac3a4601c7f4e12fc413e016b6d4b314846eb3222b2e9b1b',
      signedByDelegate: false,
      signatureDeadline: 1674748123,
      typedData: {
        domain: {
          name: 'Lens Protocol Profiles',
          version: '1',
          chainId: 80001,
          verifyingContract: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
        },
        types: {
          MirrorWithSig: [
            {
              name: 'profileId',
              type: 'uint256',
            },
            {
              name: 'profileIdPointed',
              type: 'uint256',
            },
            {
              name: 'pubIdPointed',
              type: 'uint256',
            },
            {
              name: 'referenceModuleData',
              type: 'bytes',
            },
            {
              name: 'referenceModule',
              type: 'address',
            },
            {
              name: 'referenceModuleInitData',
              type: 'bytes',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'deadline',
              type: 'uint256',
            },
          ],
        },
        value: {
          profileId: '0x18',
          profileIdPointed: '0x18',
          pubIdPointed: '0x3a',
          referenceModuleData: '0x',
          referenceModule: '0x0000000000000000000000000000000000000000',
          referenceModuleInitData: '0x',
          deadline: 1674748123,
          nonce: 243,
        },
      },
      blockHash: '0x0fb258841acaf93b998028bfc7296b840a80cdc76ffd999d5101bc72cf2daf78',
      blockNumber: 31435129,
      blockTimestamp: 1674748123,
    },
    pointer: {
      location: 'ar://ff9CtLecXt1HBFBR-SoRz8tLjPjBo8gxbmy7kmFpJl4',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-538ca9c4',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674748123,
  },
};
