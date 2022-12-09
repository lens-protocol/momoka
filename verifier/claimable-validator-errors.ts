export enum ClaimableValidatorError {
  /**
   * This means the submitted timestamp proof does not have a valid timestamp proof signature
   */
  TIMESTAMP_PROOF_INVALID_SIGNATURE = 'TIMESTAMP_PROOF_INVALID_SIGNATURE',

  /**
   * This means the submitted timestamp proof does not match up to the `dataAvailabilityId`
   * or `type` or not uploaded from the submittor whitelisted wallet
   */
  TIMESTAMP_PROOF_INVALID_UPLOAD = 'TIMESTAMP_PROOF_INVALID_UPLOAD',

  /**
   * This means the timestamp proof uploaded was not done by a valid submitter
   */
  TIMESTAMP_PROOF_NOW_SUBMITTER = 'TIMESTAMP_PROOF_NOW_SUBMITTER',

  /**
   * This means the block stated in the chain proofs are not the closest block to the timstamp
   * proofs
   */
  BLOCK_MISMATCH = 'BLOCK_MISMATCH',

  /**
   * This means the simulation was not successful and got rejected on-chain
   */
  SIMULATION_REJECTED = 'SIMULATION_REJECTED',

  /**
   * This means the event emitted from the simulation does not match the expected event
   */
  EVENT_MISMATCH = 'EVENT_MISMATCH',

  /**
   * This means the event timestamp passed into the emitted event does not match the signature timestamp
   */
  INVALID_EVENT_TIMESTAMP = 'INVALID_EVENT_TIMESTAMP',

  /**
   * This means the pointer set in the chain proofs is not required but set anyway
   */
  INVALID_POINTER_SET_NOT_NEEDED = 'INVALID_POINTER_SET_NOT_NEEDED',

  /**
   * This means the block processed against is not the closest block to the timestamp proofs
   */
  NOT_CLOSEST_BLOCK = 'NOT_CLOSEST_BLOCK',

  // BLOCK_TOO_FAR = 'BLOCK_TOO_FAR',
}
