use crate::contracts::lens_hub::{lens_hub_contract, Eip712Signature, ILensHub, PostWithSigData};
use crate::environment::environment_to_lens_hub_contract;
use crate::evm::{parse_signature, ProviderContext};
use crate::types::eip721::CreatePostEIP712TypedDataValue;
use crate::types::evm_event::PostCreatedEventEmittedResponse;
use crate::types::profile_id::ProfileId;
use crate::types::{transaction::PostCreatedPublication, verifier_error::MomokaVerifierError};

use ethers::prelude::*;
use ethers::types::U256;

/// Simulates a transaction by calling the appropriate method on the Lens Hub contract.
///
/// This function takes a `PostCreatedPublication` and simulates the transaction by constructing
/// the necessary parameters and making the corresponding contract call on the Lens Hub contract.
/// The simulation result is returned as a `U256`.
///
/// # Arguments
///
/// * `lens_hub` - An instance of `ILensHub` representing the Lens Hub contract.
/// * `publication` - A reference to the `PostCreatedPublication` to be simulated.
///
/// # Returns
///
/// * A `Result` containing the simulation result as a `U256` on success,
///   or a `MomokaVerifierError` if the simulation failed or the data couldn't be read from the node.
///
/// # Examples
///
/// ```rust
/// let lens_hub = lens_hub_contract(&lens_hub_address, &provider);
/// let publication = PostCreatedPublication::new(...);
///
/// let simulation_result = simulate_transaction(&lens_hub, &publication).await;
///
/// match simulation_result {
///     Ok(result) => {
///         println!("Simulation result: {}", result);
///     }
///     Err(error) => {
///         println!("Failed to simulate transaction: {:?}", error);
///     }
/// }
/// ```
async fn simulate_transaction(
    lens_hub: &ILensHub<&Provider<RetryClient<Http>>>,
    publication: &PostCreatedPublication,
) -> Result<U256, MomokaVerifierError> {
    let typed_data_value = publication.typed_data_value().clone();

    let sig = parse_signature(
        &publication.chain_proofs.this_publication.signature,
        typed_data_value.deadline,
    )?;

    let sig_request = PostWithSigData {
        profile_id: publication.profile_id().clone().into(),
        content_uri: typed_data_value.content_uri.clone(),
        collect_module: typed_data_value.collect_module,
        collect_module_init_data: typed_data_value.collect_module_init_data.clone().into(),
        reference_module: typed_data_value.reference_module,
        reference_module_init_data: typed_data_value.reference_module_init_data.clone().into(),
        sig: Eip712Signature {
            v: sig.v,
            r: sig.r,
            s: sig.s,
            deadline: sig.deadline.into(),
        },
    };

    let block_number = publication.chain_proofs.this_publication.block_number;

    let result: U256 = if publication.chain_proofs.this_publication.signed_by_delegate {
        lens_hub
            .post_with_sig_dispatcher(sig_request)
            .block(block_number)
            .call()
            .await
            .map_err(|_| MomokaVerifierError::DataCantBeReadFromNode)?
    } else {
        lens_hub
            .post_with_sig(sig_request)
            .block(block_number)
            .call()
            .await
            .map_err(|_| MomokaVerifierError::DataCantBeReadFromNode)?
    };

    Ok(result)
}

/// Retrieves the expected simulation result from the Lens Hub contract.
///
/// This function queries the Lens Hub contract using the provided profile ID and block number
/// to retrieve the publication count. It then increments the result by one and returns it as a `U256`.
///
/// # Arguments
///
/// * `lens_hub` - An instance of `ILensHub` representing the Lens Hub contract.
/// * `profile_id` - A reference to the `ProfileId` for which the publication count is retrieved.
/// * `block_number` - A reference to the block number at which the simulation is performed.
///
/// # Returns
///
/// * A `Result` containing the expected simulation result as a `U256` on success,
///   or a `MomokaVerifierError` if the data couldn't be read from the node.
///
/// # Examples
///
/// ```rust
/// let lens_hub = lens_hub_contract(&lens_hub_address, &provider);
/// let profile_id = ProfileId::new(...);
/// let block_number = 1000u64;
///
/// let result = get_expected_simulation_result(&lens_hub, &profile_id, &block_number).await;
///
/// match result {
///     Ok(simulation_result) => {
///         println!("Expected simulation result: {}", simulation_result);
///     }
///     Err(error) => {
///         println!("Failed to retrieve simulation result: {:?}", error);
///     }
/// }
/// ```
async fn get_expected_simulation_result(
    lens_hub: &ILensHub<&Provider<RetryClient<Http>>>,
    profile_id: &ProfileId,
    block_number: u64,
) -> Result<U256, MomokaVerifierError> {
    let result: U256 = lens_hub
        .get_pub_count(profile_id.clone().into())
        .block(block_number)
        .call()
        .await
        .map_err(|_| MomokaVerifierError::DataCantBeReadFromNode)?;

    Ok(result + U256::from(1u64))
}

/// Cross-checks the event data with the simulated publication result and typed data.
///
/// This function verifies the consistency of the event data by comparing it with the
/// simulated publication result and the corresponding typed data. It checks if the event
/// data matches the expected values for the profile ID, content URI, modules, and return data.
///
/// # Arguments
///
/// * `event` - The event emitted during the publication.
/// * `simulated_pub_result` - The simulated publication result.
/// * `value` - The typed data value used for the publication.
///
/// # Errors
///
/// This function returns an error if the event data does not match the expected values,
/// indicating an event mismatch.
///
/// # Examples
///
/// ```
/// let event = create_post_event();
/// let simulated_pub_result = simulate_publication();
/// let typed_data = create_typed_data();
///
/// if let Err(err) = cross_check_event(&event, simulated_pub_result, &typed_data) {
///     println!("Event data cross-check failed: {:?}", err);
/// }
/// ```
fn cross_check_event(
    event: &PostCreatedEventEmittedResponse,
    simulated_pub_result: U256,
    value: &CreatePostEIP712TypedDataValue,
) -> Result<(), MomokaVerifierError> {
    if simulated_pub_result != event.pub_id.clone().into()
        || value.profile_id != event.profile_id
        || value.content_uri != event.content_uri
        || value.collect_module != event.collect_module
        || !event.collect_module_return_data.is_empty()
        || value.reference_module != event.reference_module
        || !event.reference_module_return_data.is_empty()
        || !value.collect_module_init_data.is_empty()
        || !value.reference_module_init_data.is_empty()
    {
        return Err(MomokaVerifierError::EventMismatch);
    }

    Ok(())
}

/// Verifies the integrity and consistency of a post publication.
///
/// This function performs a series of verification steps to ensure the correctness
/// of the post publication. It checks the signature, simulates the transaction,
/// verifies the simulation result, and cross-checks the event data.
///
/// # Arguments
///
/// * `publication` - The post created publication to be verified.
/// * `provider_context` - The provider context used for simulation and block retrieval.
///
/// # Errors
///
/// This function returns an error if any of the verification steps fail. The possible
/// error types include:
///
/// * `InvalidPointerSetNotNeeded` - Indicates that the pointer set is invalid and not needed.
/// * `SimulationFailed` - Indicates that the simulation of the transaction failed.
/// * `PotentialReorg` - Indicates a potential reorganization of the blockchain.
/// * `CrossCheckFailed` - Indicates that the cross-check of the event data failed.
///
/// # Examples
///
/// ```
/// let publication = create_post_publication();
/// let provider_context = create_provider_context();
///
/// if let Err(err) = verifier_post(&publication, &provider_context) {
///     println!("Publication verification failed: {:?}", err);
/// }
/// ```
pub async fn verifier_post(
    publication: &PostCreatedPublication,
    provider_context: &ProviderContext,
) -> Result<(), MomokaVerifierError> {
    if publication.chain_proofs.pointer.is_some() {
        return Err(MomokaVerifierError::InvalidPointerSetNotNeeded);
    }

    let lens_hub = lens_hub_contract(
        environment_to_lens_hub_contract(&provider_context.environment).unwrap(),
        provider_context.node.provider(),
    );

    let simulation_result = simulate_transaction(&lens_hub, publication).await?;

    let expected_simulation_result = get_expected_simulation_result(
        &lens_hub,
        publication.profile_id(),
        publication.chain_proofs.this_publication.block_number,
    )
    .await?;

    if simulation_result != expected_simulation_result {
        let result = provider_context
            .node
            .get_block(publication.chain_proofs.this_publication.block_hash)
            .await;

        match result {
            Ok(_block) => {
                return Err(MomokaVerifierError::SimulationFailed);
            }
            Err(_err) => {
                return Err(MomokaVerifierError::PotentialReorg);
            }
        }
    }

    cross_check_event(
        &publication.event,
        simulation_result,
        publication.typed_data_value(),
    )?;

    Ok(())
}
