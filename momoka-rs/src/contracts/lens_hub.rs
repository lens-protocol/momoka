use std::{fs, sync::Arc};

use ethers::{
    abi::Abi,
    prelude::{abigen, Contract, Multicall},
    providers::{Http, Provider, RetryClient},
    types::{Address, BlockNumber, U256},
};

use crate::types::{profile_id::ProfileId, verifier_error::MomokaVerifierError};

abigen!(
    ILensHub,
    "./src/abi/lens_hub_contract_abi.json",
    event_derives(serde::Deserialize, serde::Serialize)
);

/// Returns a new instance of `ILensHub`, representing the Lens Protocol Hub contract
/// deployed on the Polygon (Matic) mainnet.
/// # Arguments
///
/// * `provider` - The ethers provider
///
/// # Example
///
/// ```
/// let provider =  Provider::<Http>::try_from(node_url).unwrap();
/// let contract = lens_hub_contract(&provider);
/// ```
pub fn lens_hub_contract(
    lens_hub: Address,
    // provider: &RetryClient<Http>,
    provider: &Provider<RetryClient<Http>>,
) -> ILensHub<&Provider<RetryClient<Http>>> {
    // Create a new client from the provider
    let client = Arc::new(provider);

    // Create a new instance of the ILensHub contract using the address and client
    let contract: ILensHub<&Provider<RetryClient<Http>>> = ILensHub::new(lens_hub, client);

    contract
}

/// Represents the details of a lens profile.
pub struct LensProfileDetails {
    /// The signature nonce of the lens profile.
    pub sig_nonce: U256,
    /// The current publication ID of the lens profile.
    pub current_publication_id: U256,
    /// The address of the dispatcher contract.
    pub dispatcher_address: Address,
    /// The owner of the address.
    pub owner_of_address: Address,
}

/// Gets the details of a Lens profile, including the current publication ID and the owner of the address.
///
/// # Arguments
///
/// * `profile_id` - The ID of the Lens profile in hexadecimal format.
/// * `signed_by_address` - The address of the signer.
/// * `provider` - The ethers provider
///
/// # Errors
///
/// This function can return an error if there is an issue with the ABI or if the contract call fails.
///
/// # Examples
///
/// ```
/// use ethers::prelude::*;
/// use std::str::FromStr;
/// use std::sync::Arc;
///
/// let profile_id = "0x01";
/// let signed_by_address = Address::from_str("0x1234...").unwrap();
///
/// let details = get_profile_details(&profile_id, &signed_by_address).await.unwrap();
/// assert_eq!(details.sig_nonce, U256::from(42));
/// assert_eq!(details.current_publication_id, U256::from(1234));
/// ```
pub async fn get_profile_details(
    lens_hub: Address,
    profile_id: &ProfileId,
    signed_by_address: Address,
    block_number: u64,
    provider: &Provider<RetryClient<Http>>,
) -> Result<LensProfileDetails, MomokaVerifierError> {
    let abi: Abi = serde_json::from_str(
        &fs::read_to_string("./src/abi/lens_hub_contract_abi.json")
            .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?,
    )
    .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?;

    let provider = Arc::new(&(provider));

    let contract = Contract::new(lens_hub, abi, provider.clone());

    let profile_id = <&ProfileId as Into<U256>>::into(profile_id);

    let sig_nonce_call = contract
        .method::<_, U256>("sigNonces", (signed_by_address,))
        .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?;
    let get_pub_count = contract
        .method::<_, U256>("getPubCount", profile_id)
        .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?;
    let get_dispatcher = contract
        .method::<_, Address>("getDispatcher", profile_id)
        .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?;

    let owner_of = contract
        .method::<_, Address>("ownerOf", profile_id)
        .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?;

    let mut multicall = Multicall::new(provider.clone(), None)
        .await
        .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?
        .block(BlockNumber::from(block_number));

    multicall
        .add_call(sig_nonce_call, false)
        .add_call(get_pub_count, false)
        .add_call(get_dispatcher, false)
        .add_call(owner_of, false);

    let return_data: (U256, U256, Address, Address) = multicall
        .call()
        .await
        .map_err(|_| MomokaVerifierError::SimulationNodeCouldNotRun)?;

    Ok(LensProfileDetails {
        sig_nonce: return_data.0,
        current_publication_id: return_data.1,
        dispatcher_address: return_data.2,
        owner_of_address: return_data.3,
    })
}
