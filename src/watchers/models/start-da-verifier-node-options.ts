import { StreamCallback } from './stream.type';

/**
 * Options for starting the verifier node
 */
export interface StartDAVerifierNodeOptions {
  /**
   * The callback function to be called when a new result is available
   */
  stream?: StreamCallback | undefined;

  /**
   * if true, the verifier node will only sync from the head of the chain from this point onwards
   * and will not sync from the genesis block
   */
  syncFromHeadOnly?: boolean | undefined;
}
