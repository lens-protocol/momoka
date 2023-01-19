export enum ClaimableValidatorError {
  /**
   * This means the main signature has not been signed by the same payload as the data itself
   */
  INVALID_SIGNATURE_SUBMITTER = 'INVALID_SIGNATURE_SUBMITTER',
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
  TIMESTAMP_PROOF_NOT_SUBMITTER = 'TIMESTAMP_PROOF_NOT_SUBMITTER',

  /**
   * This means the block stated in the chain proofs are not the closest block to the timstamp
   * proofs
   */
  BLOCK_MISMATCH = 'BLOCK_MISMATCH',

  /**
   * This means the simulation was not successful and got rejected on-chain
   */
  SIMULATION_FAILED = 'SIMULATION_FAILED',

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

  /**
   * This means the mirror property submitted does not have a valid pointer
   */
  MIRROR_NO_POINTER = 'MIRROR_NO_POINTER',

  /**
   * Mirror for now can only mirror another DA publication not on evm chain publications
   */
  MIRROR_NONE_DA = 'MIRROR_NONE_DA',

  /**
   * This means the mirror nonce is invalid at the time of submission
   */
  MIRROR_NONCE_INVALID = 'MIRROR_NONCE_INVALID',

  /**
   * This means the mirror submisson was signed by a wallet that is not allowed
   */
  MIRROR_SIGNER_NOT_ALLOWED = 'MIRROR_SIGNER_NOT_ALLOWED',

  /**
   * This means the comment property submitted does not have a valid pointer
   */
  COMMENT_NO_POINTER = 'COMMENT_NO_POINTER',

  /**
   * Comment for now can only comment on another DA publication not on evm chain publications
   */
  COMMENT_NONE_DA = 'COMMENT_NONE_DA',

  /**
   * This means the comment nonce is invalid at the time of submission
   */
  COMMENT_NONCE_INVALID = 'COMMENT_NONCE_INVALID',

  /**
   * This means the comment submisson was signed by a wallet that is not allowed
   */
  COMMENT_SIGNER_NOT_ALLOWED = 'COMMENT_SIGNER_NOT_ALLOWED',

  /**
   * unknown error should not happen but catch all
   */
  UNKNOWN = 'UNKNOWN',
}
