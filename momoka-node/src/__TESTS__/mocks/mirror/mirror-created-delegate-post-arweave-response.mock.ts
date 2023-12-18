import { MomokaActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { MomokaProvider } from '../../../data-availability-models/data-availability-provider';
import { CreateMirrorV1EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';

export const mirrorCreatedDelegatePostArweaveResponse: DAStructurePublication<
  DAMirrorCreatedEventEmittedResponse,
  CreateMirrorV1EIP712TypedData
> = {
  signature:
    '0x11a14ad03435338c5548154119cf151f0b827ee4598130ad3220d0fb995c24c658d47bb3f5ac88368fd654b707d74a1d1116f08e86336ddef8351ddb537ace401b',
  dataAvailabilityId: '6534728f-e7d6-47b6-94d7-8608230c4928',
  type: MomokaActionTypes.MIRROR_CREATED,
  timestampProofs: {
    type: MomokaProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'PX-Xd26m3pu_lkpeRzlBftrRAExFQOsLLEEL6eVPEoY',
      timestamp: 1674747937133,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'UCzXhdjqGvJv-lej9c1QWP0SPAwlOZ_VeKtYQcFIuUQoOyGYoLql9pSA41KIBCyfp7h54binDtmWRPeTckHoBb6S2Kcje3PJZwmplIL24IPVJZJdCMyWuyHWTPHxV0VTwxatOXKKMF5CNv5QopcO-1DeysQNtVGlRLZMnlMdyKT9ZUbMpxM1TQ7-HQtCT_FLxGRzAybg1Bbm8R6XkD5nioeIbt_4BZq5t1Bh4R1KOzr6iJopyTF44WkHGtunnyNrp3Czt2zOyvt4hVXoK36A3pbSD0dqH17EpcbpOlVr-piHd6pRLwdUVjVsddTwDg94Fzroafkb6OP-v_2yxTiUCcvKkmlyFr8fFn2UkUAW3UVvk9bImV_RizWu2OTqvdN-hdlB27Otc-TaC8Iy20ttZsBk2Jaq3HfhVtngmDv60cZ3pYlnsKIaXAXp1kVygu_mJQ4jRPyNIu-bQreBQKL7SKVrT281nGZEp7eAjqtVVoN6k8oDDSIZ-gWXzILlOk7DdNL2PQkHhXHU3CLdPIDO9PVKligee0JrOtRQ8b1vEh29xMgX89OU164dZHdi9-on2l7SYwx4cvTB9b5pneuj7YDVdWKB9L3ScoBWhhS1XfK19qf-iHCkjvvGNLSsAbQKUvB2aBVIHa7590bN-_5ic8Xtqs7DLCYpm5IL_YUbpo8',
      deadlineHeight: 1106620,
      block: 1106620,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x9297e6c9e8abf5dcc3f2c748a7fe4dc5d44aeeb8234ba7cf278398be8fc485094a10968b5c77a458beee54318247232aa488469769c9ecb0dec5e3327cbc04e81c',
      signedByDelegate: true,
      signatureDeadline: 1674747935,
      typedData: {
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
        domain: {
          name: 'Lens Protocol Profiles',
          version: '1',
          chainId: 80001,
          verifyingContract: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
        },
        value: {
          profileId: '0x18',
          profileIdPointed: '0x18',
          pubIdPointed: '0x3a',
          referenceModuleData: '0x',
          referenceModule: '0x0000000000000000000000000000000000000000',
          referenceModuleInitData: '0x',
          nonce: 0,
          deadline: 1674747935,
        },
      },
      blockHash: '0x4ea2497bdf0674b82ef6f643794f91faba5c7689a9755c17b03866b91809ed32',
      blockNumber: 31435040,
      blockTimestamp: 1674747935,
    },
    pointer: {
      location: 'ar://hyuv0DRsJIUtZq4Vhv3FS5UlUbjp5FKnLC-P1fhtLDA',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-6534728f',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674747935,
  },
};
