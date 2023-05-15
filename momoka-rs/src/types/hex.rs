use ethers::types::U256;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Hex(Vec<u8>);

#[allow(dead_code)]
impl Hex {
    pub fn new(bytes: Vec<u8>) -> Self {
        Hex(bytes)
    }

    pub fn empty() -> Self {
        Hex(Vec::new())
    }

    pub fn as_bytes(&self) -> &[u8] {
        &self.0
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn as_str(&self) -> String {
        format!("0x{}", hex::encode(&self.0))
    }
}

impl<'de> Deserialize<'de> for Hex {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct HexVisitor;

        impl<'de> serde::de::Visitor<'de> for HexVisitor {
            type Value = Hex;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("a hexadecimal string starting with '0x'")
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if value == "0x" {
                    Ok(Hex::empty())
                } else {
                    let hex_string = value.trim_start_matches("0x");
                    let bytes = hex::decode(hex_string).map_err(serde::de::Error::custom)?;
                    Ok(Hex(bytes))
                }
            }
        }

        deserializer.deserialize_str(HexVisitor)
    }
}

impl Serialize for Hex {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let hex_string = format!("0x{}", hex::encode(&self.0));
        serializer.serialize_str(&hex_string)
    }
}

impl From<Hex> for Vec<u8> {
    fn from(hex: Hex) -> Self {
        hex.0
    }
}

impl From<Hex> for U256 {
    fn from(hex: Hex) -> Self {
        U256::from_str_radix(&hex.as_str(), 16).unwrap()
    }
}

impl<'a> From<&'a Hex> for U256 {
    fn from(hex: &'a Hex) -> Self {
        U256::from_str_radix(&hex.as_str(), 16).expect("Invalid hex string")
    }
}

impl From<Hex> for ethers::types::Bytes {
    fn from(bytes: Hex) -> Self {
        ethers::types::Bytes(bytes.0.into())
    }
}
