/**
 * This is a list of all the errors that can be returned from the momoka validator
 */
export enum MomokaValidatorError {
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
   * This means the timestamp proof uploaded was not done by a valid submitter
   */
  TIMESTAMP_PROOF_NOT_SUBMITTER = 'TIMESTAMP_PROOF_NOT_SUBMITTER',

  /**
   * We tried to call them 5 times and its errored out - this is not a bad proof but bundlr/arweave are having issues
   */
  CAN_NOT_CONNECT_TO_BUNDLR = 'CAN_NOT_CONNECT_TO_BUNDLR',

  /**
   * The DA tx could not be found or invalid on the bundlr/arweave nodes
   * can happened if pasted it in wrong
   */
  INVALID_TX_ID = 'INVALID_TX_ID',

  /**
   * This the typed data format is invalid (aka a invalid address type etc)
   */
  INVALID_FORMATTED_TYPED_DATA = 'INVALID_FORMATTED_TYPED_DATA',

  /**
   * This means it can not read the block from the node
   */
  BLOCK_CANT_BE_READ_FROM_NODE = 'BLOCK_CANT_BE_READ_FROM_NODE',

  /**
   * This means it can not read the data from the node
   */
  DATA_CANT_BE_READ_FROM_NODE = 'DATA_CANT_BE_READ_FROM_NODE',

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
   * This means the pointer has failed verification
   */
  POINTER_FAILED_VERIFICATION = 'POINTER_FAILED_VERIFICATION',

  /**
   * This means the block processed against is not the closest block to the timestamp proofs
   */
  NOT_CLOSEST_BLOCK = 'NOT_CLOSEST_BLOCK',

  /**
   * This means the timestamp proofs are not close enough to the block
   */
  BLOCK_TOO_FAR = 'NOT_CLOSEST_BLOCK',

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
   * This means the evm signature has already been used
   * Only really starts to be able to be properly used when many submitters
   */
  CHAIN_SIGNATURE_ALREADY_USED = 'CHAIN_SIGNATURE_ALREADY_USED',

  /**
   * This means the publication submisson could not pass potentional due to a reorg
   */
  POTENTIAL_REORG = 'POTENTIAL_REORG',

  /**
   * This means there was a new version of the metadata that was not able to be processed.
   * Update the library to the latest version.
   */
  PUBLICATION_NOT_RECOGNIZED = 'PUBLICATION_NOT_RECOGNIZED',

  /**
   * Unknown error should not happen but catch all
   */
  UNKNOWN = 'UNKNOWN',
}
