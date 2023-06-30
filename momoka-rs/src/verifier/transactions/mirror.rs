use crate::{
    contracts::lens_hub::get_profile_details,
    environment::environment_to_lens_hub_contract,
    evm::ProviderContext,
    types::{
        eip721::{CreateMirrorEIP712TypedData, CreateMirrorEIP712TypedDataValue},
        evm_event::MirrorCreatedEventEmittedResponse,
        transaction::{MirrorCreatedPublication, TransactionPointerType},
        verifier_error::MomokaVerifierError,
    },
};
use ethers::types::{Address, U256};

use super::common::recovery_signed_typed_data;

/// Retrieves the address of the signer who signed the given mirror typed data using the provided signature.
///
/// # Arguments
///
/// * `signature` - The signature of the signer.
/// * `typed_data` - The mirror typed data containing the domain, types, and value.
///
/// # Returns
///
/// The address of the signer on success, or an error of type `MomokaVerifierError` if the operation fails.
fn who_signed_typed_data(
    signature: &str,
    typed_data: &CreateMirrorEIP712TypedData,
) -> Result<Address, MomokaVerifierError> {
    recovery_signed_typed_data(
        signature,
        &typed_data.domain.to_ethers_type(),
        &typed_data.types.mirror_with_sig,
        &typed_data.value,
        "MirrorWithSig".to_string(),
    )
}

/// Cross-checks the event emitted in the MirrorCreated transaction
/// with the provided pub_count_at_block and typed_data.
///
/// # Arguments
///
/// * `event` - The MirrorCreatedEventEmittedResponse event to cross-check.
/// * `pub_count_at_block` - The pub_count_at_block value to compare with the event's pub_id.
/// * `value` - The CreateMirrorEIP712TypedDataValue to compare with the event's fields.
///
/// # Returns
///
/// * `Result<(), MomokaVerifierError>` - Ok(()) if the cross-check passes, or an Err indicating the mismatch.
fn cross_check_event(
    event: &MirrorCreatedEventEmittedResponse,
    pub_count_at_block: &U256,
    value: &CreateMirrorEIP712TypedDataValue,
) -> Result<(), MomokaVerifierError> {
    if value.profile_id != event.profile_id
        || value.profile_id_pointed != event.profile_id_pointed
        || value.pub_id_pointed != event.pub_id_pointed
        || value.reference_module != event.reference_module
        || !value.reference_module_data.is_empty()
        || !event.reference_module_return_data.is_empty()
        || !event.reference_module_return_data.is_empty()
        || !value.reference_module_init_data.is_empty()
    {
        return Err(MomokaVerifierError::EventMismatch);
    }

    if pub_count_at_block + U256::one() != event.pub_id.clone().into() {
        return Err(MomokaVerifierError::EventMismatch);
    }

    Ok(())
}

/// Verifies the mirror created publication.
///
/// This function performs various verification checks on the provided `MirrorCreatedPublication` to ensure its validity.
/// It checks if the publication has a valid pointer, if the pointer type is on the Data Availability (DA) chain,
/// verifies the signature of the publication, checks the profile details, validates the nonce,
/// and cross-checks the event with the profile's current publication ID.
///
/// # Arguments
///
/// * `publication` - A reference to the `MirrorCreatedPublication` to be verified.
/// * `provider_context` - The provider context.
///
/// # Returns
///
/// * `Result<(), MomokaVerifierError>` - A result indicating success or failure. If the verification is successful, `Ok(())` is returned.
///   Otherwise, an `Err` variant of `MomokaVerifierError` is returned.
///
/// # Errors
///
/// The function can return the following errors:
///
/// * `PublicationNoPointer` - If the publication does not have a pointer.
/// * `PublicationNoneDA` - If the pointer type is not on the Data Availability (DA) chain.
/// * `PublicationNonceInvalid` - If the signature nonce does not match the publication nonce.
/// * `PublicationSignerNotAllowed` - If the signer address is not allowed based on the profile details.
/// * `EventMismatch` - If the event fails to cross-check with the profile's current publication ID.
/// * `GetProfileDetailsError` - If there is an error retrieving profile details from the Ethereum node.
/// * `WhoSignedTypedDataError` - If there is an error verifying the signature of the publication.
///
pub async fn verifier_mirror(
    publication: &MirrorCreatedPublication,
    provider_context: &ProviderContext,
) -> Result<(), MomokaVerifierError> {
    let pointer = publication
        .chain_proofs
        .pointer
        .as_ref()
        .ok_or(MomokaVerifierError::PublicationNoPointer)?;

    if pointer.pointer_type != TransactionPointerType::OnDa {
        return Err(MomokaVerifierError::PublicationNoneDA);
    }

    let typed_data = publication.typed_data();

    let address: Address = who_signed_typed_data(publication.signature(), typed_data)?;

    let profile_details = get_profile_details(
        environment_to_lens_hub_contract(&provider_context.environment).unwrap(),
        publication.profile_id(),
        address,
        publication.chain_proofs.this_publication.block_number,
        &provider_context.node,
    )
    .await?;

    if &profile_details.sig_nonce.as_u64() != publication.nonce() {
        return Err(MomokaVerifierError::PublicationNonceInvalid);
    }

    if profile_details.dispatcher_address != address && profile_details.owner_of_address != address
    {
        return Err(MomokaVerifierError::PublicationSignerNotAllowed);
    }

    cross_check_event(
        &publication.event,
        &profile_details.current_publication_id,
        &typed_data.value,
    )?;

    Ok(())
}
