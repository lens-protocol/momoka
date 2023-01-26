import { whoSignedTypedData } from '../../publications/publication.base';

describe('publication base', () => {
  describe('whoSignedTypedData', () => {
    test('should return back correct address', () => {
      const typedData = {
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
          contentURI: 'ar://IZHY6SC77JtgMpuKmzbecgKV9HACdMtYb6a0lY1xL14',
          referenceModule: '0x0000000000000000000000000000000000000000',
          collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
          collectModuleInitData: '0x',
          referenceModuleInitData: '0x',
          referenceModuleData: '0x',
          nonce: 243,
          deadline: 1674751411,
        },
      };

      const result = whoSignedTypedData(
        typedData.domain,
        typedData.types,
        typedData.value,
        '0x56b1108c5c15aa3344fe87aa0a5b2d827625de8a7283e5cdb21088e30d49cd4203088a336bc9c0fac5cca0a84af84b7227be24e0bef55ece423f25015e807cd71b'
      );

      expect(result.successResult!).toEqual('0xD8c789626CDb461ec9347f26DDbA98F9383aa457');
    });
  });
});
