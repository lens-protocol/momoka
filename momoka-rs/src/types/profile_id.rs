use ethers::types::U256;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

/// Represents a profile ID as a wrapper around U256.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProfileId(U256);

impl ProfileId {
    /// Creates a new ProfileId instance.
    pub fn new(value: U256) -> Self {
        ProfileId(value)
    }

    /// Returns the inner U256 value.
    pub fn into_inner(self) -> U256 {
        self.0
    }

    /// Returns the profile ID as a formatted hex string.
    pub fn as_str(&self) -> String {
        let mut hex_string = format!("{:x}", self.0);
        if hex_string.len() % 2 != 0 {
            hex_string.insert(0, '0');
        }
        format!("0x{}", hex_string)
    }
}

impl From<U256> for ProfileId {
    fn from(value: U256) -> Self {
        ProfileId::new(value)
    }
}

impl Serialize for ProfileId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.as_str())
    }
}

impl<'de> Deserialize<'de> for ProfileId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let hex_string = String::deserialize(deserializer)?;
        let profile_id = U256::from_str_radix(&hex_string.trim_start_matches("0x"), 16)
            .map_err(serde::de::Error::custom)?;
        Ok(ProfileId::new(profile_id))
    }
}

impl fmt::Display for ProfileId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl From<ProfileId> for U256 {
    fn from(profile_id: ProfileId) -> Self {
        U256::from_str_radix(&profile_id.as_str(), 16).unwrap()
    }
}

impl<'a> From<&'a ProfileId> for U256 {
    fn from(profile_id: &'a ProfileId) -> Self {
        U256::from_str_radix(&profile_id.as_str(), 16).expect("Invalid profile id")
    }
}
