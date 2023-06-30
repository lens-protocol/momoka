use std::{str::FromStr, time::Duration};

use ethers::{
    providers::{Http, HttpRateLimitRetryPolicy, Provider, RetryClient, RetryClientBuilder},
    utils::hex,
};
use serde::{Deserialize, Serialize};

use crate::{
    environment::{Deployment, Environment},
    types::verifier_error::MomokaVerifierError,
};

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct SigRequest {
    pub v: u8,
    pub r: [u8; 32],
    pub s: [u8; 32],
    pub deadline: u64,
}

/// Parses the signature string and constructs a `SigRequest` object.
///
/// This function takes a signature string in hexadecimal format and decodes it into its
/// corresponding components: `v`, `r`, `s`, and `deadline`. The resulting components are
/// used to create a `SigRequest` object that represents the signature.
///
/// # Arguments
///
/// * `signature` - The signature string in hexadecimal format.
/// * `deadline` - The deadline value associated with the signature.
///
/// # Errors
///
/// This function returns a `Result` which can contain a `MomokaVerifierError` if the
/// signature fails to decode from hexadecimal format.
///
/// # Examples
///
/// ```
/// use crate::MomokaVerifierError;
///
/// let signature = "0x1234567890abcdef";
/// let deadline = 1234567890;
///
/// match parse_signature(signature, deadline) {
///     Ok(sig_request) => println!("{:?}", sig_request),
///     Err(err) => eprintln!("Failed to parse signature: {:?}", err),
/// }
/// ```
pub fn parse_signature(signature: &str, deadline: u64) -> Result<SigRequest, MomokaVerifierError> {
    let bytes = hex::decode(&signature[2..]).map_err(|_| MomokaVerifierError::SimulationFailed)?;
    let v = bytes[64];
    let mut r_bytes = [0u8; 32];
    r_bytes.copy_from_slice(&bytes[..32]);
    let mut s_bytes = [0u8; 32];
    s_bytes.copy_from_slice(&bytes[32..64]);

    Ok(SigRequest {
        v,
        r: r_bytes,
        s: s_bytes,
        deadline,
    })
}

/// Represents the provider context, including the environment, node provider, and deployment details.
#[derive(Debug)]
pub struct ProviderContext {
    /// The environment configuration.
    pub environment: Environment,
    /// The node provider with retry capabilities.
    pub node: Provider<RetryClient<Http>>,
    /// The deployment details.
    pub deployment: Deployment,
}

/// Creates an EVM provider using the provided node URL.
///
/// # Arguments
///
/// * `node_url` - The URL of the Ethereum node to connect to.
///
/// # Returns
///
/// A provider instance with retry capabilities for interacting with the EVM.
pub fn evm_provider(node_url: &str) -> Provider<RetryClient<Http>> {
    Provider::new(
        RetryClientBuilder::default()
            .rate_limit_retries(10)
            .timeout_retries(10)
            .initial_backoff(Duration::from_millis(500))
            .build(
                Http::from_str(node_url).unwrap(),
                Box::<HttpRateLimitRetryPolicy>::default(),
            ),
    )
}
