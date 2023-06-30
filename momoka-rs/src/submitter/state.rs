use std::str::FromStr;

use ethers::types::Address;

use crate::environment::{Deployment, Environment};

/// Returns the list of authorized submitters for a given environment and deployment.
///
/// This method will return a list of authorized submitters for a given environment and deployment.
///
/// # Arguments
///
/// * `environment` - An `Environment` value representing the target environment.
/// * `deployment` - A `Deployment` value representing the target deployment.
///
/// # Examples
///
/// ```
/// use momoka_sdk::shared::{get_submitters, Environment, Deployment};
///
/// let environment = Environment::MUMBAI;
/// let deployment = Deployment::STAGING;
///
/// let submitters = get_submitters(&environment, &deployment);
/// assert_eq!(submitters.len(), 1);
/// ```
pub fn get_submitters(environment: &Environment, deployment: &Deployment) -> Vec<Address> {
    match deployment {
        Deployment::Production => match environment {
            Environment::Polygon => {
                vec![Address::from_str("0xBe29464B9784a0d8956f29630d8bc4D7B5737435").unwrap()]
            }
            Environment::Mumbai => {
                vec![Address::from_str("0xEE3E8f53df70C3A3eeDA2076CDCa17c451aa8F96").unwrap()]
            }
            Environment::Sandbox => panic!("Not Supported"),
        },
        Deployment::Staging => match environment {
            Environment::Polygon => panic!("Not Supported"),
            Environment::Mumbai => {
                vec![Address::from_str("0x122938FE0d1fC6e00EF1b814cD7e44677e99b4f7").unwrap()]
            }
            Environment::Sandbox => panic!("Not Supported"),
        },
        Deployment::Local => match environment {
            Environment::Polygon => panic!("Not Supported"),
            Environment::Mumbai => {
                vec![Address::from_str("0x8Fc176aA6FC843D3422f0C1832f1b9E17be00C1c").unwrap()]
            }
            Environment::Sandbox => panic!("Not Supported"),
        },
    }
}

/// Checks if a given address is an authorized submitter.
///
/// This method will check if a given address is an authorized submitter for a given environment and deployment.
///
/// # Arguments
///
/// * `environment` - An `Environment` value representing the target environment.
/// * `address` - A `&str` value representing the address to check.
/// * `deployment` - A `Deployment` value representing the target deployment.
///
/// # Examples
///
/// ```
/// use momoka_sdk::shared::{is_valid_submitter, Environment, Deployment};
///
/// let environment = Environment::MUMBAI;
/// let deployment = Deployment::STAGING;
///
/// let is_valid = is_valid_submitter(&environment, "0x122938FE0d1fC6e00EF1b814cD7e44677e99b4f7", &deployment);
/// assert!(is_valid);
/// ```
pub fn is_valid_submitter(
    environment: &Environment,
    address: &Address,
    deployment: &Deployment,
) -> bool {
    get_submitters(environment, deployment).contains(&address)
}
