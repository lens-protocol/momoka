import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { DAProvider } from '../../../data-availability-models/data-availability-provider';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DACommentCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';
import { CreateCommentV1EIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';

export const commentCreatedDelegateArweaveResponse: DAStructurePublication<
  DACommentCreatedEventEmittedResponse,
  CreateCommentV1EIP712TypedData
> = {
  signature:
    '0xd422257695bbc5cd9e75e128c864b1a498fa281673d91d972edafdcc8459fdef7f755343ebf5a39ab32189425df653d2c31b908d9f6142c41ae6b59b125804201b',
  dataAvailabilityId: '1f337269-6e83-4e91-94e0-7da2038d1a8b',
  type: DAActionTypes.COMMENT_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'AkE_aGaF0V-gacWAZ8H5G9y79sidDOTKrpFGoMsrQcs',
      timestamp: 1674740686651,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'GrviEYIyWdX1RLjEK32cV-F9ZyCXYtKT29YFxz5LGqOqKvqjRA0KWoEqgotrMI7fVg7geuKf5gT9QFJ9_UjqgE0aCblGrrAXa_NtVF37Smec4yBwhsALuDnnXZugyltkYAWms-gHsZ5VPiFmA0Yzo3I5OcLGMGq5Isjcbo56AzXEFUVQaNKhZ8h9DLsPzkpRbU1hMAp-niPBBYF3pclT-Lfg1XaZAK0I81LMX5IzObI4W4ECwBTjy0_T5jFD_THlfqJqloBOaGHgTxcnFcQGSJb30zopvrhkEfnjtM8OErHY2iuqAINdXHPikpkeNAeVsIHtFss9BnSaHnPniT2Cbf4AMnaCndFNTEaY1N8CWn2RqmMbfLaoO1vdwg_XbFVrq1JmPBGhvLFz6K5t9UoclgE8HiWpgEgU_GiauL4GXPQiWz85J77DKXPodC6xQFQenU1vM0y2QZ5VZ6wt9K_R2NJjyTBjNR1rnbcC6hVUWJ_Jm4QxeOrdM8CJDmdPws3RniJBtX5UggE1zG1riQdgAevTLSuj8b9Wh0zr_zz1OUmVjrhYAfeKA4vBJ3hxjuMFe_epAx9rKh_zLlHoTJcaau40_x_hjupQS4imGBy9vSDfS-oUGHhI3UX041FFZ8mvSOvqN0oPe4d9iL2Om2bHpyjBr5qDm_B5p21520pf85Q',
      deadlineHeight: 1106561,
      block: 1106561,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0xe1947e75a0ba8d56a77a19ec8b67b5e6e277c5cc9f968e5f230b158ed0896eaf0b0e5fd15bd7895a685e7bff8bec17c3123ff855b11e8ad9522d3667d9e584091c',
      signedByDelegate: true,
      signatureDeadline: 1674740685,
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
          contentURI: 'ar://xd0iTVH-FZyZKjGh7KY8E3MyNT1qbdbZYVrB_OQfvIw',
          referenceModule: '0x0000000000000000000000000000000000000000',
          collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
          collectModuleInitData: '0x',
          referenceModuleInitData: '0x',
          referenceModuleData: '0x',
          nonce: 0,
          deadline: 1674740685,
        },
      },
      blockHash: '0xa4b833e32ff44b7d55e1dfc662959790ef684c153f060a4ad1f52281b2ac8f72',
      blockNumber: 31431635,
      blockTimestamp: 1674740685,
    },
    pointer: {
      location: 'ar://TEoFkgD0m-LLQkfViuCTKfCLK_xpSxzPUNoMjBLnvlI',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-1f337269',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    contentURI: 'ar://xd0iTVH-FZyZKjGh7KY8E3MyNT1qbdbZYVrB_OQfvIw',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
    collectModuleReturnData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674740685,
  },
};
