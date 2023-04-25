const crypto = require('crypto');

Object.defineProperty(globalThis, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
  },
});
