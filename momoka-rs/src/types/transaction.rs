use std::str::FromStr;

use crate::evm::ProviderContext;
use crate::verifier::transactions::comment::verifier_comment;
use crate::verifier::transactions::mirror::verifier_mirror;
use crate::verifier::transactions::post::verifier_post;

use super::eip721::{
    CreateCommentEIP712TypedDataValue, CreateCommentEIP712Types, CreateMirrorEIP712TypedDataValue,
    CreateMirrorEIP712Types, CreatePostEIP712TypedDataValue, EIP712TypedData, TypedData,
};
use super::evm_event::EvmEvent;
use super::profile_id::ProfileId;
use super::publication_id::PublicationId;
use super::verifier_error::MomokaVerifierError;
use super::{
    chain_proofs::ChainProofs,
    eip721::{
        CreateCommentEIP712TypedData, CreateMirrorEIP712TypedData, CreatePostEIP712TypedData,
    },
    evm_event::{
        CommentCreatedEventEmittedResponse, MirrorCreatedEventEmittedResponse,
        PostCreatedEventEmittedResponse,
    },
};
use ethers::types::Address;
use json::JsonValue;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub type MomokaTxId = String;

/// An enum representing the type of action associated with a transaction.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
#[allow(clippy::enum_variant_names)]
pub enum TransactionAction {
    PostCreated,
    CommentCreated,
    MirrorCreated,
}

/// An enum representing the type of provider associated with a transaction.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TransactionProvider {
    Bundlr,
}

/// An enum representing the type of pointer associated with a transaction.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum TransactionPointerType {
    OnEvmChain,
    OnDa,
}

/// A struct representing the signature of a validator for transaction timestamp proofs.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct TransactionTimestampProofsValidatorSignature {
    pub address: String,
    pub signature: String,
}

/// A struct representing the validation of transaction timestamp proofs.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionTimestampProofsValidation {
    /// The ID of the transaction.
    pub id: MomokaTxId,

    /// The UNIX (MS precision) timestamp of when the node received the Tx. Only optional if the upload receives a `201` error in response to a duplicate transaction upload.
    pub timestamp: u64,

    /// Response version.
    pub version: String,

    /// The public key of the validating node.
    #[serde(rename = "public")]
    pub public_key: String,

    /// The signature of this receipt.
    pub signature: String,

    /// The deadline height.
    pub deadline_height: u64,

    /// The maximum expected Arweave block height for transaction inclusion.
    pub block: u32,

    /// The validator signatures.
    pub validator_signatures: Vec<TransactionTimestampProofsValidatorSignature>,
}

/// A struct representing the summary of a timestamp proof.
pub struct TimestampProofsSummary {
    /// The ID of the transaction.
    pub id: MomokaTxId,

    /// The response to the timestamp proof validation.
    pub response: TimestampProofsResponse,
}

/// A struct representing the response to a timestamp proof validation.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TimestampProofsResponse {
    /// The action type.
    #[serde(rename = "type")]
    pub action_type: TransactionAction,

    /// The data availability ID.
    pub data_availability_id: Uuid,
}

/// A struct representing a pointer to a transaction.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct TransactionPointer {
    /// The location of the pointer.
    // #[serde(deserialize_with = "parse_and_replace")]
    pub location: String,

    /// The type of pointer.
    #[serde(rename = "type")]
    pub pointer_type: TransactionPointerType,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BasePublication<TEvent, TTypedData, TPointer>
where
    TEvent: EvmEvent,
    TTypedData: TypedData,
    TPointer: Into<Option<TransactionPointer>>,
{
    /// The signature of the publication.
    pub signature: String,

    /// The ID of the data availability layer used for this publication.
    pub data_availability_id: Uuid,

    /// The type of the transaction that generated this publication.
    #[serde(rename = "type")]
    pub publication_type: TransactionAction,

    /// Timestamp proofs of the transaction that generated this publication.
    pub timestamp_proofs: TransactionTimestampProofs,

    /// Chain proofs of the transaction that generated this publication.
    pub chain_proofs: ChainProofs<TTypedData, TPointer>,

    /// The ID of the publication.
    pub publication_id: String,

    /// The event that generated this publication.
    pub event: TEvent,
}

/// A `BasePublication` representing a post created on the platform.
pub type PostCreatedPublication = BasePublication<
    PostCreatedEventEmittedResponse,
    CreatePostEIP712TypedData,
    Option<TransactionPointer>,
>;

impl PostCreatedPublication {
    pub fn typed_data_value(&self) -> &CreatePostEIP712TypedDataValue {
        &self.chain_proofs.this_publication.typed_data.value
    }

    pub fn profile_id(&self) -> &ProfileId {
        &self.typed_data_value().profile_id
    }
}

/// A `BasePublication` representing a comment created on the platform.
pub type CommentCreatedPublication = BasePublication<
    CommentCreatedEventEmittedResponse,
    CreateCommentEIP712TypedData,
    Option<TransactionPointer>,
>;

impl CommentCreatedPublication {
    pub fn typed_data(
        &self,
    ) -> &EIP712TypedData<CreateCommentEIP712Types, CreateCommentEIP712TypedDataValue> {
        &self.chain_proofs.this_publication.typed_data
    }

    pub fn profile_id(&self) -> &ProfileId {
        &self.typed_data().value.profile_id
    }

    pub fn signature(&self) -> &String {
        &self.chain_proofs.this_publication.signature
    }

    pub fn nonce(&self) -> &u64 {
        &self.typed_data().value.nonce
    }
}

/// A `BasePublication` representing a mirror created on the platform.
pub type MirrorCreatedPublication = BasePublication<
    MirrorCreatedEventEmittedResponse,
    CreateMirrorEIP712TypedData,
    Option<TransactionPointer>,
>;

impl MirrorCreatedPublication {
    pub fn typed_data(
        &self,
    ) -> &EIP712TypedData<CreateMirrorEIP712Types, CreateMirrorEIP712TypedDataValue> {
        &self.chain_proofs.this_publication.typed_data
    }

    pub fn profile_id(&self) -> &ProfileId {
        &self.typed_data().value.profile_id
    }

    pub fn signature(&self) -> &String {
        &self.chain_proofs.this_publication.signature
    }

    pub fn nonce(&self) -> &u64 {
        &self.typed_data().value.nonce
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[allow(clippy::enum_variant_names)]
/// An enum representing a Momoka transaction.
pub enum MomokaTransaction {
    PostCreated(PostCreatedPublication),
    CommentCreated(CommentCreatedPublication),
    MirrorCreated(MirrorCreatedPublication),
}

#[derive(Debug, Clone, PartialEq, Eq)]
#[allow(clippy::enum_variant_names)]
/// An enum representing a Momoka transaction name.
pub enum MomokaTransactionName {
    PostCreated,
    CommentCreated,
    MirrorCreated,
}

impl FromStr for MomokaTransactionName {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "POST_CREATED" => Ok(MomokaTransactionName::PostCreated),
            "COMMENT_CREATED" => Ok(MomokaTransactionName::CommentCreated),
            "MIRROR_CREATED" => Ok(MomokaTransactionName::MirrorCreated),
            _ => Err(()),
        }
    }
}

#[allow(unreachable_patterns)]
impl MomokaTransaction {
    /// Converts a JSON-encoded transaction of a given type to the corresponding `MomokaTransaction`.
    ///
    /// # Arguments
    ///
    /// * `json` - A `&str` containing the JSON-encoded transaction data.
    /// * `transaction_type` - A reference to a `MomokaTransactionName` indicating the type of transaction to parse.
    ///
    /// # Returns
    ///
    /// A `Result` containing a `MomokaTransaction` object if the transaction was parsed successfully, or a `MomokaVerifierError` if there was an error parsing the transaction or the transaction type is not recognized.
    pub fn from_json(
        json: &str,
        transaction_type: &MomokaTransactionName,
    ) -> Result<Self, MomokaVerifierError> {
        match transaction_type {
            MomokaTransactionName::PostCreated => {
                serde_json::from_str::<PostCreatedPublication>(json)
                    .map(MomokaTransaction::PostCreated)
                    .map_err(|_| MomokaVerifierError::InvalidTransactionFormat)
            }
            MomokaTransactionName::CommentCreated => {
                serde_json::from_str::<CommentCreatedPublication>(json)
                    .map(MomokaTransaction::CommentCreated)
                    .map_err(|_| MomokaVerifierError::InvalidTransactionFormat)
            }
            MomokaTransactionName::MirrorCreated => {
                serde_json::from_str::<MirrorCreatedPublication>(json)
                    .map(MomokaTransaction::MirrorCreated)
                    .map_err(|_| MomokaVerifierError::InvalidTransactionFormat)
            }
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns a reference to the timestamp proofs associated with the transaction.
    ///
    /// # Returns
    ///
    /// A reference to the `TransactionTimestampProofs` object containing the timestamp proofs.
    pub fn get_timestamp_proofs(&self) -> Result<&TransactionTimestampProofs, MomokaVerifierError> {
        match self {
            MomokaTransaction::PostCreated(publication) => Ok(&publication.timestamp_proofs),
            MomokaTransaction::CommentCreated(publication) => Ok(&publication.timestamp_proofs),
            MomokaTransaction::MirrorCreated(publication) => Ok(&publication.timestamp_proofs),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Determines if the event timestamp of a `MomokaTransaction` matches the block timestamp
    /// associated with it in the transaction's chain proofs.
    ///
    /// Returns `Ok(true)` if the timestamps match, otherwise `Ok(false)`.
    ///
    /// # Errors
    ///
    /// Returns an error of type `MomokaVerifierError::InvalidTransactionType` if the `MomokaTransaction`
    /// variant is not supported.
    pub fn is_valid_event_timestamp(&self) -> Result<bool, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => 
                Ok(e.event.timestamp == e.chain_proofs.this_publication.block_timestamp),
            MomokaTransaction::MirrorCreated(e) =>
                Ok(e.event.timestamp == e.chain_proofs.this_publication.block_timestamp),
            MomokaTransaction::PostCreated(e) =>
                Ok(e.event.timestamp == e.chain_proofs.this_publication.block_timestamp),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Determines whether the typed data deadline timestamp in this transaction
    /// matches the block timestamp.
    ///
    /// # Returns
    ///
    /// A `Result` containing a `bool` indicating whether the typed data deadline
    /// timestamp matches the block timestamp, or an `Err` if the transaction
    /// type is invalid.
    pub fn is_valid_typed_data_deadline_timestamp(&self) -> Result<bool, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) =>
                Ok(e.chain_proofs.this_publication.typed_data.value.deadline
                    == e.chain_proofs.this_publication.block_timestamp),
            MomokaTransaction::MirrorCreated(e) =>
                Ok(e.chain_proofs.this_publication.typed_data.value.deadline
                    == e.chain_proofs.this_publication.block_timestamp),
            MomokaTransaction::PostCreated(e) =>
                Ok(e.chain_proofs.this_publication.typed_data.value.deadline
                    == e.chain_proofs.this_publication.block_timestamp),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Verifies the integrity of a `PostCreatedPublication` using the Ethereum blockchain.
    ///
    /// # Arguments
    ///
    /// * `publication` - A `PostCreatedPublication` to be verified.
    /// * `provider_context` - The provider context
    ///
    /// # Returns
    ///
    /// A `Result<(), MomokaVerifierError>` indicating whether the verification succeeded or failed.
    pub async fn validate_transaction(
        &self,
        provider_context: &ProviderContext,
    ) -> Result<(), MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) =>
                verifier_comment(e, provider_context).await,
            MomokaTransaction::MirrorCreated(e) =>
                verifier_mirror(e, provider_context).await,
            MomokaTransaction::PostCreated(e) =>
                verifier_post(e, provider_context).await,
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Retrieves the block number associated with the transaction.
    ///
    /// # Returns
    ///
    /// A `Result` containing a reference to the block number, or a `MomokaVerifierError` if the transaction type is invalid.
    pub fn block_number(&self) -> Result<&u64, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => {
                Ok(&e.chain_proofs.this_publication.block_number)
            }
            MomokaTransaction::MirrorCreated(e) => {
                Ok(&e.chain_proofs.this_publication.block_number)
            }
            MomokaTransaction::PostCreated(e) => Ok(&e.chain_proofs.this_publication.block_number),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns a reference to the transaction signature.
    ///
    /// # Errors
    ///
    /// Returns an error of `MomokaVerifierError::InvalidTransactionType` if called on an invalid transaction type.
    ///
    /// # Examples
    ///
    /// ```
    /// use momoka_rs::{MomokaTransaction, MomokaVerifierError};
    ///
    /// let tx = MomokaTransaction::PostCreated(...);
    /// let signature = tx.signature()?;
    /// println!("Transaction signature: {}", signature);
    /// ```
    pub fn signature(&self) -> Result<&str, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => Ok(&e.signature),
            MomokaTransaction::MirrorCreated(e) => Ok(&e.signature),
            MomokaTransaction::PostCreated(e) => Ok(&e.signature),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns a reference to the timestamp in the third-party timestamp proofs of the transaction.
    ///
    /// # Errors
    ///
    /// Returns an error of type `MomokaVerifierError::InvalidTransactionType` if the transaction
    /// is not of type `CommentCreated`, `MirrorCreated`, or `PostCreated`.
    ///
    /// # Examples
    ///
    /// ```
    /// use momoka_rs::{MomokaTransaction, MomokaVerifierError};
    ///
    /// let tx = MomokaTransaction::CommentCreated(comment);
    /// let timestamp = tx.third_party_proofs_timestamp()?;
    ///
    /// assert_eq!(*timestamp, 1621380354);
    /// # Ok::<(), MomokaVerifierError>(())
    /// ```
    pub fn third_party_proofs_timestamp(&self) -> Result<&u64, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => Ok(&e.timestamp_proofs.response.timestamp),
            MomokaTransaction::MirrorCreated(e) => Ok(&e.timestamp_proofs.response.timestamp),
            MomokaTransaction::PostCreated(e) => Ok(&e.timestamp_proofs.response.timestamp),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns a reference to the `TransactionPointer` contained in this transaction's
    /// `ChainPublicationProofs`, or `None` if the transaction type is `PostCreated`.
    ///
    /// # Examples
    ///
    /// ```
    /// use momoka_rs::{MomokaTransaction, TransactionPointer};
    ///
    /// let pointer = Some(TransactionPointer {
    ///     txid: "0x1234567890abcdef".to_string(),
    ///     block_hash: "0x0987654321fedcba".to_string(),
    ///     block_number: 123456,
    /// });
    ///
    /// let tx = MomokaTransaction::CommentCreated(MyCommentPublication {
    ///     // ...
    ///     chain_proofs: ChainPublicationProofs {
    ///         this_publication: ChainPublication {
    ///             // ...
    ///             pointer,
    ///         },
    ///         // ...
    ///     },
    ///     // ...
    /// });
    ///
    /// assert_eq!(tx.pointer().unwrap(), &pointer);
    /// ```
    pub fn pointer(&self) -> Result<&Option<TransactionPointer>, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => Ok(&e.chain_proofs.pointer),
            MomokaTransaction::MirrorCreated(e) => Ok(&e.chain_proofs.pointer),
            MomokaTransaction::PostCreated(_) => Ok(&None),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Formats a publication ID by combining the given `profile_id`, `pub_id`, and `data_availability_id`.
    ///
    /// The resulting ID is in the format `profile_id-pub_id-DA-{short_data_availability_id}`, where
    /// `short_data_availability_id` is the first substring before the first '-' character in `data_availability_id`.
    ///
    /// # Arguments
    ///
    /// * `profile_id`: A `String` representing the profile ID.
    /// * `pub_id`: A `String` representing the publication ID.
    /// * `data_availability_id`: A `String` representing the data availability ID.
    ///
    /// # Returns
    ///
    /// A `String` representing the formatted publication ID.
    fn format_publication_id(
        &self,
        profile_id: &ProfileId,
        pub_id: &PublicationId,
        data_availability_id: &Uuid,
    ) -> Result<String, MomokaVerifierError> {
        let end_id = data_availability_id
            .to_string()
            .split('-')
            .next()
            .ok_or(MomokaVerifierError::GeneratedPublicationIdMismatch)?
            .to_string();

        Ok(format!("{}-{}-DA-{}", profile_id, pub_id, end_id))
    }

    /// Generates a publication ID based on the transaction event's profile ID, publication ID,
    /// and data availability ID.
    ///
    /// This function formats the publication ID using the `format_publication_id` method and returns
    /// a reference to the generated ID string.
    ///
    /// # Errors
    ///
    /// Returns an error of type `MomokaVerifierError::InvalidTransactionType` if the transaction
    /// is not of type `CommentCreated`, `MirrorCreated`, or `PostCreated`, or if an error occurs
    /// while formatting the publication ID.
    ///
    /// # Arguments
    ///
    /// * `self`: A reference to the `MomokaTransaction` instance.
    ///
    /// # Returns
    ///
    /// A `Result` containing a reference to the generated publication ID string, or an error if
    /// the transaction type is invalid or an error occurs during for
    fn generate_publication_id(&self) -> Result<String, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => Ok(self.format_publication_id(
                &e.event.profile_id,
                &e.event.pub_id,
                &e.data_availability_id,
            )?),
            MomokaTransaction::MirrorCreated(e) => Ok(self.format_publication_id(
                &e.event.profile_id,
                &e.event.pub_id,
                &e.data_availability_id,
            )?),
            MomokaTransaction::PostCreated(e) => Ok(self.format_publication_id(
                &e.event.profile_id,
                &e.event.pub_id,
                &e.data_availability_id,
            )?),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Checks whether the generated publication ID matches the publication ID
    /// contained within the transaction.
    ///
    /// # Returns
    ///
    /// - `Ok(true)` if the generated publication ID matches the transaction's
    ///   publication ID.
    /// - `Ok(false)` if the generated publication ID does not match the
    ///   transaction's publication ID.
    /// - `Err` if the transaction type is invalid or if there is an error
    ///   generating the publication ID.
    pub fn valid_publication_id(&self) -> Result<bool, MomokaVerifierError> {
        let generated_publication_id = self.generate_publication_id()?;
        match self {
            MomokaTransaction::CommentCreated(e) => {
                Ok(generated_publication_id == e.publication_id)
            }
            MomokaTransaction::MirrorCreated(e) => Ok(generated_publication_id == e.publication_id),
            MomokaTransaction::PostCreated(e) => Ok(generated_publication_id == e.publication_id),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns the address of the verifying contract for the transaction.
    ///
    /// # Errors
    ///
    /// Returns an error of type `MomokaVerifierError::InvalidTransactionType` if the transaction
    /// type is not supported.
    ///
    /// # Returns
    ///
    /// Returns a reference to the address of the verifying contract.
    ///
    pub fn verifying_contract(&self) -> Result<&Address, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => Ok(&e
                .chain_proofs
                .this_publication
                .typed_data
                .domain
                .verifying_contract),
            MomokaTransaction::MirrorCreated(e) => Ok(&e
                .chain_proofs
                .this_publication
                .typed_data
                .domain
                .verifying_contract),
            MomokaTransaction::PostCreated(e) => Ok(&e
                .chain_proofs
                .this_publication
                .typed_data
                .domain
                .verifying_contract),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns the transaction type associated with the `MomokaTransaction`.
    ///
    /// # Returns
    ///
    /// - `Ok(&TransactionAction)`: The transaction type.
    /// - `Err(MomokaVerifierError)`: If the transaction type is invalid.
    pub fn transaction_type(&self) -> Result<&TransactionAction, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(t) => Ok(&t.publication_type),
            MomokaTransaction::MirrorCreated(t) => Ok(&t.publication_type),
            MomokaTransaction::PostCreated(t) => Ok(&t.publication_type),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns the data availability ID associated with the `MomokaTransaction`.
    ///
    /// # Returns
    ///
    /// - `Ok(&Uuid)`: The data availability ID.
    /// - `Err(MomokaVerifierError)`: If the transaction type is invalid.
    pub fn data_availability_id(&self) -> Result<&Uuid, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(t) => Ok(&t.data_availability_id),
            MomokaTransaction::MirrorCreated(t) => Ok(&t.data_availability_id),
            MomokaTransaction::PostCreated(t) => Ok(&t.data_availability_id),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    /// Returns the collect module address specified in the typed data of the transaction.
    ///
    /// # Errors
    ///
    /// Returns an error if the transaction type is not supported.
    ///
    /// # Examples
    ///
    /// ```
    /// use ethers::types::Address;
    /// use crate::MomokaVerifierError;
    ///
    /// let tx = MomokaTransaction::PostCreated(PostCreatedPublication {
    ///     event: PostCreatedEventEmittedResponse {
    ///         profile_id: "profile_id".to_string(),
    ///         pub_id: "pub_id".to_string(),
    ///         title: "title".to_string(),
    ///         author: "author".to_string(),
    ///         timestamp: 123456789,
    ///         data_type: "data_type".to_string(),
    ///     },
    ///     chain_proofs: PublicationChainData {
    ///         this_publication: PublicationProofData {
    ///             typed_data: EIP712TypedData {
    ///                 domain: EIP712TypedDataDomain {
    ///                     name: "name".to_string(),
    ///                     version: "version".to_string(),
    ///                     chain_id: 1.into(),
    ///                     verifying_contract: Address::zero(),
    ///                 },
    ///                 types: EIP712Types::default(),
    ///                 primary_type: "primary_type".to_string(),
    ///                 message: CreatePostEIP712TypedDataValue {
    ///                     author: "author".to_string(),
    ///                     title: "title".to_string(),
    ///                     data_type: "data_type".to_string(),
    ///                     profile_id: "profile_id".to_string(),
    ///                     pub_id: "pub_id".to_string(),
    ///                     deadline: 123456789,
    ///                 },
    ///             },
    ///             block_timestamp: 123456789,
    ///             block_number: 1.into(),
    ///         },
    ///         pointer: None,
    ///     },
    ///     timestamp_proofs: TimestampResponse {
    ///         publisher: "publisher".to_string(),
    ///         data_availability_id: "data_availability_id".to_string(),
    ///         response: TimestampProof {
    ///             timestamp: 123456789,
    ///             signature: "signature".to_string(),
    ///         },
    ///     },
    ///     data_availability_id: "data_availability_id".to_string(),
    /// });
    ///
    /// let result = tx.typed_data_collect_module();
    ///
    /// assert_eq!(result.unwrap(), &Address::zero());
    /// ```
    pub fn typed_data_collect_module(&self) -> Result<Option<&Address>, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(e) => Ok(Some(
                &e.chain_proofs
                    .this_publication
                    .typed_data
                    .value
                    .collect_module,
            )),
            MomokaTransaction::MirrorCreated(_) => Ok(None),
            MomokaTransaction::PostCreated(e) => Ok(Some(
                &e.chain_proofs
                    .this_publication
                    .typed_data
                    .value
                    .collect_module,
            )),
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }

    pub fn get_inner_object(&self) -> Result<JsonValue, MomokaVerifierError> {
        match self {
            MomokaTransaction::CommentCreated(_) => {
                let serialized = serde_json::to_string(self)
                    .map_err(|_| MomokaVerifierError::InvalidSignatureSubmitter)?;
                let parsed = json::parse(&serialized)
                    .map_err(|_| MomokaVerifierError::InvalidSignatureSubmitter)?;
                Ok(parsed["CommentCreated"].clone())
            }
            MomokaTransaction::MirrorCreated(_) => {
                let serialized = serde_json::to_string(self)
                    .map_err(|_| MomokaVerifierError::InvalidSignatureSubmitter)?;
                let parsed = json::parse(&serialized)
                    .map_err(|_| MomokaVerifierError::InvalidSignatureSubmitter)?;
                Ok(parsed["MirrorCreated"].clone())
            }
            MomokaTransaction::PostCreated(_) => {
                let serialized = serde_json::to_string(self)
                    .map_err(|_| MomokaVerifierError::InvalidSignatureSubmitter)?;
                let parsed = json::parse(&serialized)
                    .map_err(|_| MomokaVerifierError::InvalidSignatureSubmitter)?;
                Ok(parsed["PostCreated"].clone())
            }
            _ => Err(MomokaVerifierError::InvalidTransactionType),
        }
    }
}

/// The `TransactionTimestampProofs` struct represents the timestamp proofs
/// included with a transaction to verify its authenticity and integrity.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransactionTimestampProofs {
    /// The type of the transaction provider.
    #[serde(rename = "type")]
    pub proofs_type: TransactionProvider,
    /// The hash prefix of the timestamp proofs.
    pub hash_prefix: String,
    /// The response object for the timestamp proofs validation.
    pub response: TransactionTimestampProofsValidation,
}

/// The `TransactionSummary` struct represents a summary of a transaction,
/// containing its ID, associated `MomokaTransaction`, and submitter information,
/// as well as an optional `TimestampProofsResponse` object.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct TransactionSummary {
    /// The ID of the transaction.
    pub id: MomokaTxId,
    /// The associated `MomokaTransaction`.
    pub momoka_tx: MomokaTransaction,
    /// The submitter of the transaction.
    pub submitter: Address,
    /// An optional `TimestampProofsResponse` object.
    pub timestamp_proofs_response: Option<TimestampProofsResponse>,
    /// The pointer if known!
    pub pointer_transaction_summary: Option<Box<TransactionSummary>>,
}

impl TransactionSummary {
    /// Sets the `TimestampProofsResponse` object for the transaction summary.
    pub fn set_timestamp_proofs_response(&mut self, response: TimestampProofsResponse) {
        self.timestamp_proofs_response = Some(response);
    }

    /// Sets the `TransactionSummary` for the pointer
    pub fn set_pointer_transaction_summary(&mut self, response: Box<TransactionSummary>) {
        self.pointer_transaction_summary = Some(response);
    }
}

#[derive(Debug, Deserialize)]
pub struct TransactionError {
    pub id: MomokaTxId,
    pub error: MomokaVerifierError,
}

impl TransactionError {
    pub fn new(id: MomokaTxId, error: MomokaVerifierError) -> Self {
        Self { id, error }
    }
}
