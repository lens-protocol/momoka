use std::{collections::BTreeMap, str::FromStr};

use ethers::types::{
    transaction::eip712::{EIP712Domain, Eip712, Eip712DomainType, TypedData},
    Address, Signature,
};
use serde::Serialize;
use serde_json::Value;

use crate::types::verifier_error::MomokaVerifierError;

/// Recovers the address from a signed typed data using a given signature.
///
/// # Arguments
///
/// * `signature` - The signature to recover the address from.
/// * `domain` - The EIP712 domain parameters.
/// * `types` - The list of EIP712 domain types.
/// * `value` - The value representing the typed data.
/// * `primary_type_name` - The primary type name used for the typed data.
///
/// # Returns
///
/// The recovered address on success, or an error of type `MomokaVerifierError` if the
/// operation fails.
pub fn recovery_signed_typed_data<TValue: Serialize>(
    signature: &str,
    domain: &EIP712Domain,
    types: &[Eip712DomainType],
    value: &TValue,
    primary_type_name: String,
) -> Result<Address, MomokaVerifierError> {
    let mut types_map = BTreeMap::new();
    types_map.insert(primary_type_name.to_owned(), types.to_vec());

    let message: BTreeMap<String, Value> = serde_json::from_str(
        &serde_json::to_string(value)
            .map_err(|_| MomokaVerifierError::InvalidFormattedTypedData)?,
    )
    .map_err(|_| MomokaVerifierError::InvalidFormattedTypedData)?;

    let typed_data: TypedData = TypedData {
        domain: domain.clone(),
        types: types_map,
        primary_type: primary_type_name,
        message,
    };

    let hash = typed_data
        .encode_eip712()
        .map_err(|_| MomokaVerifierError::InvalidFormattedTypedData)?;

    let signature = Signature::from_str(signature)
        .map_err(|_| MomokaVerifierError::InvalidFormattedTypedData)?;

    let address = signature
        .recover(hash)
        .map_err(|_| MomokaVerifierError::InvalidFormattedTypedData)?;

    Ok(address)
}
