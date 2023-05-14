use ethers::types::Address;
use serde::{Deserialize, Serialize};

use super::{hex::Hex, profile_id::ProfileId, publication_id::PublicationId};

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PostCreatedEventEmittedResponse {
    pub profile_id: ProfileId,

    pub pub_id: PublicationId,

    #[serde(rename = "contentURI")]
    pub content_uri: String,

    pub collect_module: Address,

    pub collect_module_return_data: Hex,

    pub reference_module: Address,

    pub reference_module_return_data: Hex,

    pub timestamp: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CommentCreatedEventEmittedResponse {
    pub profile_id: ProfileId,

    pub pub_id: PublicationId,

    #[serde(rename = "contentURI")]
    pub content_uri: String,

    pub profile_id_pointed: ProfileId,

    pub pub_id_pointed: PublicationId,

    pub reference_module_data: Hex,

    pub collect_module: Address,

    pub collect_module_return_data: Hex,

    pub reference_module: Address,

    pub reference_module_return_data: Hex,

    pub timestamp: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MirrorCreatedEventEmittedResponse {
    pub profile_id: ProfileId,

    pub pub_id: PublicationId,

    pub profile_id_pointed: ProfileId,

    pub pub_id_pointed: PublicationId,

    pub reference_module_data: Hex,

    pub reference_module: Address,

    pub reference_module_return_data: Hex,

    pub timestamp: u64,
}

pub trait EvmEvent {
    fn get_timestamp(&self) -> u64;
}

impl<T> EvmEvent for Box<T>
where
    T: EvmEvent + ?Sized,
{
    fn get_timestamp(&self) -> u64 {
        (**self).get_timestamp()
    }
}

impl EvmEvent for PostCreatedEventEmittedResponse {
    fn get_timestamp(&self) -> u64 {
        self.timestamp
    }
}

impl EvmEvent for CommentCreatedEventEmittedResponse {
    fn get_timestamp(&self) -> u64 {
        self.timestamp
    }
}

impl EvmEvent for MirrorCreatedEventEmittedResponse {
    fn get_timestamp(&self) -> u64 {
        self.timestamp
    }
}
