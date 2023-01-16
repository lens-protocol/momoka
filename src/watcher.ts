import { checkDASubmisson } from './main';

// verifierWatcher().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

// dispatcher post success - r3UOSyjBXWkYGV6SXJpBWo3uD9qeh9yuHxPA8T1eoyA
// typed data post success - mYHhpnLGF-lFB2s7zPVmH1RFQLi_oEz1F4bW7e3hOMw

// dispatcher comment success - 2-SgkC1xwFHmeTCsZulsm9X_6neMNsSXYX3BMHtWSts
// dispatcher comment2 success - 44zi1HMDYtVY6QZunikqsyUqaaBGLF7pPZ1iNAK_WqA
// typed data comment success - EapbTklm5v9DJf2aH7YvlljEMvRYRYv9ljT0LRYEfDY

// dispatcher mirror block race error - rb6chDZAaIEmDXpGkofdi120iH1exX8XPRnk1KmtIbU
// dispatcher mirror success - Nqf2LsYs7xMj6_BqsdXwxrnvLb3DYH95ApcVSIJguFQ

checkDASubmisson('EapbTklm5v9DJf2aH7YvlljEMvRYRYv9ljT0LRYEfDY').catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
