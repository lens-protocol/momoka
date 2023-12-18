/**
 * Does this over ethers call as alchemy and some other providers dont like a padding hex number
 * - wont accept 0x01f1a494
 * - will accept 0x1f1a494
 * @param number
 * @returns
 */
export const numberToHex = (number: number): string => {
  return '0x' + number.toString(16);
};
