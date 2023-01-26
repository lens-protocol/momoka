import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { DAProvider } from '../../../data-availability-models/data-availability-provider';
import { CreateCommentEIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DACommentCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';

export const commentCreatedWithoutDelegateArweaveResponse: DAStructurePublication<
  DACommentCreatedEventEmittedResponse,
  CreateCommentEIP712TypedData
> = {
  signature:
    '0xcd9824d89bd3b237ed1230cf914630d756cae83904d835a1e85d37c11dbfab5e42c1f02042469ab29a3ccbd428c9a64576ad77f5876130b9c2bd49e0a83e9b7c1c',
  dataAvailabilityId: '9a0b1d2b-e36e-48fc-87b4-b5f3f509b494',
  type: DAActionTypes.COMMENT_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'xtVsUj5j1T4T86IQlJk2u-KubGD5oKIXOJQlU3KyGR0',
      timestamp: 1674747795383,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'TZh1F7z14pbuHq7IBlHqnhT4PXEa2dQngiL-iHEXot3-w_ScVLyN9naCeuHvAP4mialS62YPucToy4o1UQlMEtTYS2i6C0rPap32xGi2yDA6AtzURf-xELI33em-mr9QIEuOph34t0yRLn3_Bl0n-AV4jyjVSgHdYjUT0vNZx3TbRkBi_v0PgJHDYkyezP_NrZgTomEe_VZmBgozc0J9zzK6atbIdsPnHYDbY3qzTujJEwogVQa311lNZvVe2ND6MR_0EUyVVW0esin6dyYEIPPCrjlFwMMgaoW4vBbGd1d11cRGopYgNvcX_0EuwAWYGwi8XW_GNGyrk4Df14VnOXAuP4NKd5oia820Be1vqwuAs3ubWX0OQ7CttOgohO9ns7CjYg9DVIwY5-AuJd2wAK6eI09fot-lTNVwtMVBvyxQ4GWaYspMcqkpysOY-5ow0wFp7K4Ad1FI4NO71cbEZQWD8ou08_A5Gd2a6qZF2fb7IJKka0aim26N858faf1nqViZfL-aym-AW60ydNav8inrTxVTMXml61WeG4KwlQXDrdoWkEquLB-1mJ-_519ozgy0QjSbyctp4LjpDpdp-yiJvzfweMFVRIKxarVB9Vvc0NFhyllE8sZud8zLBZ7wo7GG_1wijCJaICo-iD_FK97ZegnhotGLzeDC-KqY2vQ',
      deadlineHeight: 1106619,
      block: 1106619,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x5156c7e636be61a305373df811d8444b7715448e2bde3fe69d388f301270d83d72796c5ef58283c1a9d32b37033a6b567a32addb78aedef0957fbf56956cd2351b',
      signedByDelegate: false,
      signatureDeadline: 1674747793,
      typedData: {
        types: {
          CommentWithSig: [
            {
              name: 'profileId',
              type: 'uint256',
            },
            {
              name: 'contentURI',
              type: 'string',
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
          profileIdPointed: '0x18',
          pubIdPointed: '0x3a',
          contentURI: 'ar://5JNO_BIyW7sD8crn1PPt3SrCZUKF9t-f8Rs13Zh1w1Q',
          referenceModule: '0x0000000000000000000000000000000000000000',
          collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
          collectModuleInitData: '0x',
          referenceModuleInitData: '0x',
          referenceModuleData: '0x',
          nonce: 243,
          deadline: 1674747793,
        },
      },
      blockHash: '0x11b2e5b1b7fa87c3a30d10d6f0416f5cb540c30ac7ae4b1be5058d9b5031e172',
      blockNumber: 31434975,
      blockTimestamp: 1674747793,
    },
    pointer: {
      location: 'ar://TEoFkgD0m-LLQkfViuCTKfCLK_xpSxzPUNoMjBLnvlI',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-9a0b1d2b',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    contentURI: 'ar://5JNO_BIyW7sD8crn1PPt3SrCZUKF9t-f8Rs13Zh1w1Q',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
    collectModuleReturnData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674747793,
  },
};
