import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { DAProvider } from '../../../data-availability-models/data-availability-provider';
import { CreatePostEIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import { DAStructurePublication } from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAPostCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';

export const postCreatedDelegateArweaveResponse: DAStructurePublication<
  DAPostCreatedEventEmittedResponse,
  CreatePostEIP712TypedData
> = {
  signature:
    '0x42c63a72de7442c809a8db23f9994ff3c57b5a2101e8512102ea1238a78181903513c675ea35bd2e912f1a258dabe631fd22b3609e9edcd1a9df799c0ebc03621c',
  dataAvailabilityId: '68d40ddd-a9ae-4843-b9e8-50ed55e27488',
  type: DAActionTypes.POST_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'DMGovTZKvZkWCbhgm1mRNi3MrjMl9lJtQ-0ReW4j7Wc',
      timestamp: 1674650243344,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'bbrYlPfRjsAQiAlkv8ghwHp5_uf66jMZ6ovr2sCxJSYSY57wr64K4iJ0DF097TxvZFPaP-JvqAejXWYZ1QAi48BITZpv8dtiVpYG9-eE03dvx-FcxuGGAGN4K9KwGbeMauipOW4yLd_oRH4OZHIFcCJn_XU5oSGnV0GlopG3GkQy095Z9a7DaDZEEFc5-r6wVnsWrLuqDWmhRxfu2RcSripf5YSAELa03LX6-Hn3yGKi3aAA3xz90d2irLmj3Ib-qVPMWez0NwacsSecEQ_zR3sudsWn3T6KG5DxRGr8sCvx-5S9Mbg5YEPQx2GVgL7oPYxlQD3y1XNhupv3eB-9mfGq4AvvC2vD9xW-q7zgCl5gKZSnVffxrhmo4gU_pq0TP6ES-d-6Npk8szhjSFxgV_lpWbHfY0l2wr9WLQ87FcP5l4cDXNwBl62hR9w11vz86TzxIA-NWSYEjkAoge6-yfOK2n8ln0UOURMdumSh6kPPFfASkQdi3geBJuCoUIcuXScaExhiHrbUantrfuqd6o7hH-_GtYr1690V7zRS40Ie5vfrQZ-2WiwNFuNUdOnLqL-f4ftTXMvd3D8_QBSUuIpkZt4lWL6LxdEbw9niCzpN-yfCS4G22UFZn8MaGLKY2am5GdQ2DHceYFd2QhYC9-_7GZklobZwWP__oAn3_gc',
      block: 1105854,
      deadlineHeight: 1105854,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x9e777c60c7745be9412795c0deae73d26844f2ba0b80672c31b554d8f204103f2c59769290ff436cd65cc9b4632f2a168e598222fc6a212ccbc62b6525ca73231b',
      signedByDelegate: true,
      signatureDeadline: 1674650240,
      typedData: {
        types: {
          PostWithSig: [
            {
              name: 'profileId',
              type: 'uint256',
            },
            {
              name: 'contentURI',
              type: 'string',
            },
            {
              name: 'collectModule',
              type: 'address',
            },
            {
              name: 'collectModuleInitData',
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
        domain: {
          name: 'Lens Protocol Profiles',
          version: '1',
          chainId: 80001,
          verifyingContract: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
        },
        value: {
          profileId: '0x18',
          contentURI: 'ar://CB1hvV_8Wxx-QkKyhYGheSCrXfr-W9TObXXDuU32p5k',
          collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
          collectModuleInitData: '0x',
          referenceModule: '0x0000000000000000000000000000000000000000',
          referenceModuleInitData: '0x',
          nonce: 0,
          deadline: 1674650240,
        },
      },
      blockHash: '0x10953c796b043fac60c8758fa68190aaebe6e0752fb42796fa832e67dccadbd0',
      blockNumber: 31389215,
      blockTimestamp: 1674650240,
    },
    pointer: null,
  },
  publicationId: '0x18-0x3a-DA-68d40ddd',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    contentURI: 'ar://CB1hvV_8Wxx-QkKyhYGheSCrXfr-W9TObXXDuU32p5k',
    collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
    collectModuleReturnData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674650240,
  },
};
