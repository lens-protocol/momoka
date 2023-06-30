use serde::{Deserialize, Serialize};
use std::{
    error::Error,
    fmt::{Display, Formatter, Result},
};
use strum_macros::EnumString;

#[derive(Debug, EnumString, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub enum MomokaVerifierError {
    /// This means it has an invalid transaction type
    InvalidTransactionType,
    /// This means it has an invalid transaction format and could not parse it (missing data from the object)
    InvalidTransactionFormat,
    /// This means the main signature has not been signed by the same payload as the data itself
    InvalidSignatureSubmitter,
    /// This means the submitted timestamp proof does not have a valid timestamp proof signature
    TimestampProofInvalidSignature,
    /// This means the type in the timestamp proofs do not match timestamp proofs are not portable
    TimestampProofInvalidType,
    /// This means the da id in the timestamp proofs do not match up timestamp proofs are not portable
    TimestampProofInvalidDAID,
    /// This means the timestamp proof uploaded was not done by a valid submitter
    TimestampProofNotSubmitter,
    /// We tried to call them 5 times and its errored out - this is not a bad proof but bundlr/arweave are having issues
    CannotConnectToBundlr,
    /// The DA tx could not be found or invalid on the bundlr/arweave nodes can happened if pasted it in wrong
    InvalidTxID, // NOT USED!
    /// This the typed data format is invalid (aka a invalid address type etc)
    InvalidFormattedTypedData,
    /// This means it can not read the block from the node
    BlockCantBeReadFromNode,
    /// This means it can not read the data from the node
    DataCantBeReadFromNode,
    /// This means the simulation was not able to be ran on the node, this does not mean that it would fail on chain, it means the nodes may of been down and needs rechecking
    SimulationNodeCouldNotRun,
    /// This means the simulation was not successful and got rejected on-chain or the result from the simulation did not match the expected result
    SimulationFailed,
    /// This means the event emitted from the simulation does not match the expected event
    EventMismatch,
    /// This means the event timestamp passed into the emitted event does not match the signature timestamp
    InvalidEventTimestamp,
    /// This means the deadline set in the typed data is not correct
    InvalidTypedDataDeadlineTimestamp,
    /// This means the generated publication id for the generic id does not match what it should be
    GeneratedPublicationIdMismatch,
    /// This means the pointer set in the chain proofs is not required but set anyway
    InvalidPointerSetNotNeeded,
    /// This means the pointer has failed verification
    PointerFailedVerification,
    /// This means the block processed against is not the closest block to the timestamp proofs
    NotClosestBlock,
    /// This means the timestamp proofs are not close enough to the block
    BlockTooFar, // NOT USED!
    /// This means the publication submitted does not have a valid pointer and a pointer is required
    PublicationNoPointer,
    /// Some publications (comment and mirror) for now can only be on another DA publication not on evm chain publications
    PublicationNoneDA,
    /// This means the publication nonce is invalid at the time of submission
    PublicationNonceInvalid,
    /// This means the publication submisson was signed by a wallet that is not allowed
    PublicationSignerNotAllowed,
    /// This means the evm signature has already been used Only really starts to be able to be properly used when many submitters
    ChainSignatureAlreadyUsed,
    /// This means the publication submisson could not pass potentional due to a reorg
    PotentialReorg,
    /// internal cache has broken!
    CacheError,
    // bundlr could not find last transaction (most likely API down)
    NoLastTransactionFound,
}

impl Display for MomokaVerifierError {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        let error_name = self;
        write!(f, "{}", error_name)
    }
}

impl Error for MomokaVerifierError {}

// Implement the Send trait for your error type
unsafe impl Send for MomokaVerifierError {}
