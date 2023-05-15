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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_publication_id_new() {
        let u256 = U256::from(42u64);
        let publication_id = PublicationId::new(u256);

        // Assert that the PublicationId constructor returns the expected value
        assert_eq!(publication_id, PublicationId(U256::from(42u64)));
    }

    #[test]
    fn test_publication_id_into_inner() {
        let u256 = U256::from(42u64);
        let publication_id = PublicationId::new(u256);

        // Assert that the into_inner method returns the expected value
        assert_eq!(publication_id.into_inner(), U256::from(42u64));
    }

    #[test]
    fn test_publication_id_as_str() {
        let u256 = U256::from(42u64);
        let publication_id = PublicationId::new(u256);

        // Assert that the as_str method returns the expected value
        assert_eq!(publication_id.as_str(), "0x2a");
    }

    #[test]
    fn test_publication_id_from_u256() {
        let u256 = U256::from(42u64);
        let publication_id = PublicationId::from(u256);

        // Assert that the From<U256> implementation returns the expected value
        assert_eq!(publication_id, PublicationId(U256::from(42u64)));
    }

    #[test]
    fn test_publication_id_serde() {
        let publiation_id = PublicationId::new(U256::from(1));

        let serialized = serde_json::to_string(&publiation_id).unwrap();
        let deserialized: PublicationId = serde_json::from_str(&serialized).unwrap();

        assert_eq!(deserialized, publiation_id);
    }

    #[test]
    fn test_publication_id_fmt() {
        let u256 = U256::from(42u64);
        let publication_id = PublicationId::new(u256);

        // Assert that the Display implementation returns the expected value
        assert_eq!(format!("{}", publication_id), "0x2a");
    }
}
