const crypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
  },
});

// eslint-disable-next-line no-undef
jest.setTimeout(15000);
