export enum ClaimableValidatorError {
  /**
   * This means the main signature has not been attached to the payload
   */
  NO_SIGNATURE_SUBMITTER = 'NO_SIGNATURE_SUBMITTER',

  /**
   * This means the main signature has not been signed by the same payload as the data itself
   */
  INVALID_SIGNATURE_SUBMITTER = 'INVALID_SIGNATURE_SUBMITTER',

  /**
   * This means the submitted timestamp proof does not have a valid timestamp proof signature
   */
  TIMESTAMP_PROOF_INVALID_SIGNATURE = 'TIMESTAMP_PROOF_INVALID_SIGNATURE',

  /**
   * This means the type in the timestamp proofs do not match
   * timestamp proofs are not portable
   */
  TIMESTAMP_PROOF_INVALID_TYPE = 'TIMESTAMP_PROOF_INVALID_TYPE',

  /**
   * This means the da id in the timestamp proofs do not match up
   * timestamp proofs are not portable
   */
  TIMESTAMP_PROOF_INVALID_DA_ID = 'TIMESTAMP_PROOF_INVALID_DA_ID',

  /**
   * This means the submitted timestamp proof does not match up to the `dataAvailabilityId`
   * or `type` or not uploaded from the submittor whitelisted wallet
   */
  // TIMESTAMP_PROOF_INVALID_UPLOAD = 'TIMESTAMP_PROOF_INVALID_UPLOAD',

  /**
   * This means the timestamp proof uploaded was not done by a valid submitter
   */
  TIMESTAMP_PROOF_NOT_SUBMITTER = 'TIMESTAMP_PROOF_NOT_SUBMITTER',

  /**
   * This means it can not read the block from the node
   */
  BLOCK_CANT_BE_READ_FROM_NODE = 'BLOCK_CANT_BE_READ_FROM_NODE',

  /**
   * This means the block stated in the chain proofs are not the closest block to the timstamp
   * proofs
   */
  // BLOCK_MISMATCH = 'BLOCK_MISMATCH',

  /**
   * We tried to call them 5 times and its errored out - this is not a bad proof but bundlr/arweave are having issues
   */
  CAN_NOT_CONNECT_TO_ARWEAVE = 'CAN_NOT_CONNECT_TO_ARWEAVE',

  /**
   * This the typed data format is invalid (aka a invalid address type etc)
   */
  INVALID_FORMATTED_TYPED_DATA = 'INVALID_FORMATTED_TYPED_DATA',

  /**
   * This means the simulation was not able to be ran on the node, this does not mean
   * that it would fail on chain, it means the nodes may of been down and needs rechecking
   */
  SIMULATION_NODE_COULD_NOT_RUN = 'SIMULATION_NODE_COULD_NOT_RUN',

  /**
   * This means the simulation was not successful and got rejected on-chain
   * or the result from the simulation did not match the expected result
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
   * This means the deadline set in the typed data is not correct
   */
  INVALID_TYPED_DATA_DEADLINE_TIMESTAMP = 'INVALID_TYPED_DATA_DEADLINE_TIMESTAMP',

  /**
   * This means the generated publication id for the generic id does not match
   * what it should be
   */
  GENERATED_PUBLICATION_ID_MISMATCH = 'GENERATED_PUBLICATION_ID_MISMATCH',

  /**
   * This means the pointer set in the chain proofs is not required but set anyway
   */
  INVALID_POINTER_SET_NOT_NEEDED = 'INVALID_POINTER_SET_NOT_NEEDED',

  /**
   * This means the block processed against is not the closest block to the timestamp proofs
   */
  NOT_CLOSEST_BLOCK = 'NOT_CLOSEST_BLOCK',

  /**
   * This means the publication submitted does not have a valid pointer
   * and a pointer is required
   */
  PUBLICATION_NO_POINTER = 'PUBLICATION_NO_POINTER',

  /**
   * Some publications (comment and mirror) for now can only be on another
   * DA publication not on evm chain publications
   */
  PUBLICATION_NONE_DA = 'PUBLICATION_NONE_DA',

  /**
   * This means the publication nonce is invalid at the time of submission
   */
  PUBLICATION_NONCE_INVALID = 'PUBLICATION_NONCE_INVALID',

  /**
   * This means the publication submisson was signed by a wallet that is not allowed
   */
  PUBLICATION_SIGNER_NOT_ALLOWED = 'PUBLICATION_SIGNER_NOT_ALLOWED',

  /**
   * unknown error should not happen but catch all
   */
  UNKNOWN = 'UNKNOWN',
}
