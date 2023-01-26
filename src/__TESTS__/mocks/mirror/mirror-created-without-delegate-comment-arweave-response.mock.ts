import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { DAProvider } from '../../../data-availability-models/data-availability-provider';
import { CreateMirrorEIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';

export const mirrorCreatedWithoutDelegateCommentArweaveResponse: DAStructurePublication<
  DAMirrorCreatedEventEmittedResponse,
  CreateMirrorEIP712TypedData
> = {
  signature:
    '0x9a80809f6db6f28a96e14ec588125ceecf4824a65c2e7ca748f8de7fd1531c696cb119eb5027fc09d02c8eb64700e8d470302c328780a12767da3696d69d46d81c',
  dataAvailabilityId: 'b812eb36-30d8-4657-bd42-b239621b8696',
  type: DAActionTypes.MIRROR_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'YfgVWKZ4jV19_IhFucPKIjjgyCJLcKfxH7Q1SUbRSWM',
      timestamp: 1674748394302,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'aDE6Au_oFRE3C0smwqs149GXozAds7UKy9hg6bsC2ErlEgvp3zG-zJJOYaq1AYYOOv2lb4c2IkVQjVphheTTni4WtS0WJbptEmIA6n1aRiHTGmSWa21P9JIInMh5OXGuABJTm5UzKmZfbKGzDVGquAmYc9TI5IP1G4KgY-wQwT3Tm6R61JcP39ePSNzqYUqfaHKQUZ3bxgJPNqhYN5wrhnK7_ZDzSgVPX6a5VJeWWrIooQOX5b3dA73PWlrSXWZjTJWY9TatFnG64xOIvfWcopRQmXig6cxhFVi4jCtfB9A6j6KlxbCCCYFfGeh0kegh52THNGyyajOBDWy8ik6uRfg5NswWRf0UtSJSfKfxjx9x-UpQVUIo2ILL0HjgIh_9rBu9Ydj27QBWBTcx7WVVzbuVdf6E2LOnp5ROngZyMIOxs7tEqwA6R0m33ltdLbRYXKCD8q9Q6hywSWQ2uS0SDgST5_dCGuWt1EdXRL8her4dUWw59v0vikc5Mki1ypJuocpvTqARDKelojhmTdTlllvTJSGofsh3rmzXtntTlqdDYeWbIBUb8Rf6rZR3pXbtMcCpxQI2jbaDbzB130UBYWxKqCzd9uJe4phw5Fwe9vXoMrqRjmm5c9CzM2rJdOlF26emagFyvZYaJwrzEInpPQ_ijxuPd0KmNx8dnIcc12g',
      deadlineHeight: 1106623,
      block: 1106623,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x2c5dd1fd96b4ca5ded1b1469b84b462b83508a91c6ed0ee13f819e7c642e20287be5c4f64388d3864d3936a670292be170e0755c7e8cdc667185eb1ae6cb0e291b',
      signedByDelegate: false,
      signatureDeadline: 1674748393,
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
          deadline: 1674748393,
          nonce: 243,
        },
      },
      blockHash: '0x295c6ee6f57c1d71b60a1054f09462aa65bcc8b76c4158069991355455cf3724',
      blockNumber: 31435254,
      blockTimestamp: 1674748393,
    },
    pointer: {
      location: 'ar://lPz6ZB0Ie19UbQ8qPqAH0-mT7Wi1A1P34bkvx3QmVu0',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-b812eb36',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674748393,
  },
};
