use ethers::types::H256;
use serde::{Deserialize, Serialize};

use super::{eip721::TypedData, transaction::TransactionPointer};

/// Represents a collection of cryptographic proofs related to a chain publication,
/// where the proofs are verified and validated by the chain. This proof structure is
/// specific to the Lens Network protocol and depends on the format of typed data and
/// the blockchain where the publication was recorded.
///
/// `TTypedData` is the type of the typed data that is part of this publication,
/// and `TPointer` is the type of the transaction pointer, which may be `Option<TransactionPointer>`
/// or a similar type depending on how it is being used.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainProofs<TTypedData, TPointer>
where
    TTypedData: TypedData,
    TPointer: Into<Option<TransactionPointer>>,
{
    /// The current chain publication
    pub this_publication: ChainPublication<TTypedData>,

    /// The transaction pointer
    pub pointer: TPointer,
}

/// Represents a publication on the chain that has been signed by the delegate,
/// and can be verified and validated by the chain.
///
/// `TTypedData` is the type of the typed data that is part of this publication.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainPublication<TTypedData>
where
    TTypedData: TypedData,
{
    /// The signature for the publication
    pub signature: String,

    /// Indicates whether the publication was signed by the delegate or not
    pub signed_by_delegate: bool,

    /// The deadline for the signature
    pub signature_deadline: u64,

    /// The typed data
    pub typed_data: TTypedData,

    /// The block hash
    pub block_hash: H256,

    /// The block number
    pub block_number: u64,

    /// The block timestamp
    pub block_timestamp: u64,
}
