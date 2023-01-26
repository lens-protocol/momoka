import { DAActionTypes } from '../../../data-availability-models/data-availability-action-types';
import { DAProvider } from '../../../data-availability-models/data-availability-provider';
import { CreateMirrorEIP712TypedData } from '../../../data-availability-models/publications/data-availability-publication-typed-data';
import {
  DAPublicationPointerType,
  DAStructurePublication,
} from '../../../data-availability-models/publications/data-availability-structure-publication';
import { DAMirrorCreatedEventEmittedResponse } from '../../../data-availability-models/publications/data-availability-structure-publications-events';

export const mirrorCreatedDelegateCommentArweaveResponse: DAStructurePublication<
  DAMirrorCreatedEventEmittedResponse,
  CreateMirrorEIP712TypedData
> = {
  signature:
    '0x9480369047ce27715600bdbf391dec6e4b62c36cd1840b5def450f78398ae2007f6b4c520343819bc2fe15a0e5835e4cfe577900522e8a526ae042e6186884961b',
  dataAvailabilityId: '1cc575ce-3c64-4ab5-bdb9-a13153b0afc1',
  type: DAActionTypes.MIRROR_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 's-CnsDdnEn5aaz8pFKdq897bQUtiCmHY263zJrfQ5xA',
      timestamp: 1674748249813,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'k9Kk_0U5Dp6EExgM7EqSwddDK7xbylo26hV-QuskavGn8hajXKRRv26Vl7iOz8GF8Rc1KKhn5LzwBSzH7fLeb7wyKYHm0NjKVOcl6EN__kpD982WAkNlbgST2v0s8R6ZttVMad_MiqETsIqAgA67RwGeOC7cMNkS1rMLXX_CULhWNne8v-bp_Tnvnfhvp6r66sz0STi8gDhcKT26btV-WT7NskIOfJlVz97f0IGcoFr7-DUQU9tT5Y2a8Vwk52w_iUwIioDhNmkWmdyP-9fw-3qESGmFjFXpzpN437wd9N2ekWowFExgfHLSgscTdi_68csJUqbkD0DbGLkFphwYc8KX3A4R1yTDo-uOOWCvZySFUMDVLLw1Xgm0tJCI7aX8-xmO2-BSOZeJ9jx5RVG7uSY2gecdAehHOpkijAcgZzK6f6lz56phKZPOieoXdfkBHgnk2BAbDuAo7ZMz1deS85w6A0TEN_etSY0s5hhWJv8Sm4w8PuRpomG14drFJ5R9QaZFuqialgusenOT9MqSPhBstfjQj1rV7xfqU-uldKbQH5a--_La_uRYjxnGWOuMXq1_6pAt55l0v_zuDJbOWexEn1mL4TBsntEEu-CDN04-nmGns1cwI4MNlrLCWUdKiwZK1Up_CfLCeBzkwVOz0FXGaaPoBffkWDlq-AiW0PY',
      deadlineHeight: 1106621,
      block: 1106621,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x0fedbd19cf72c37193154ae05fb45ebcfc006bd54e5d5030f015eafe0614cfb07165814023aad71c569a70cc78ee6cd2f33b92f7d27189bae498945f10d2fc501c',
      signedByDelegate: true,
      signatureDeadline: 1674748249,
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
          deadline: 1674748249,
        },
      },
      blockHash: '0x86a48c0edc9dcc60bbcf83a785fcadb83820fc588c6d8eafed3c50d75c33b6ae',
      blockNumber: 31435186,
      blockTimestamp: 1674748249,
    },
    pointer: {
      location: 'ar://b_Sdj7RRevayrg3ybcxyDHdwQAB3DgD-n8_SFXmROtU',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-1cc575ce',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674748249,
  },
};
