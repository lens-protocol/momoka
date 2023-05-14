use ethers::types::U256;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

/// Represents a publication ID as a wrapper around U256.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublicationId(U256);

impl PublicationId {
    /// Creates a new PublicationId instance.
    pub fn new(value: U256) -> Self {
        PublicationId(value)
    }

    /// Returns the inner U256 value.
    pub fn into_inner(self) -> U256 {
        self.0
    }

    /// Returns the publication ID as a formatted hex string.
    pub fn as_str(&self) -> String {
        let mut hex_string = format!("{:x}", self.0);
        if hex_string.len() % 2 != 0 {
            hex_string.insert(0, '0');
        }
        format!("0x{}", hex_string)
    }
}

impl From<U256> for PublicationId {
    fn from(value: U256) -> Self {
        PublicationId::new(value)
    }
}

impl Serialize for PublicationId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.as_str())
    }
}

impl<'de> Deserialize<'de> for PublicationId {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        let hex_string = String::deserialize(deserializer)?;
        let publication_id = U256::from_str_radix(&hex_string.trim_start_matches("0x"), 16)
            .map_err(serde::de::Error::custom)?;
        Ok(PublicationId::new(publication_id))
    }
}

impl fmt::Display for PublicationId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl From<PublicationId> for U256 {
    fn from(publication_id: PublicationId) -> Self {
        U256::from_str_radix(&publication_id.as_str(), 16).unwrap()
    }
}

impl<'a> From<&'a PublicationId> for U256 {
    fn from(publication_id: &'a PublicationId) -> Self {
        U256::from_str_radix(&publication_id.as_str(), 16).expect("Invalid hex string")
    }
}
