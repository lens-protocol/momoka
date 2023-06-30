use ethers::types::{
    transaction::eip712::{EIP712Domain, Eip712DomainType},
    Address, U256,
};
use serde::{Deserialize, Serialize};

use super::{hex::Hex, profile_id::ProfileId, publication_id::PublicationId};

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TypedDataDomain {
    pub name: String,

    pub version: String,

    pub chain_id: u32,

    pub verifying_contract: Address,
}

impl TypedDataDomain {
    pub fn to_ethers_type(&self) -> EIP712Domain {
        EIP712Domain {
            name: Some(self.name.clone()),
            version: Some(self.version.clone()),
            chain_id: Some(U256::from(self.chain_id)),
            salt: None,
            verifying_contract: Some(self.verifying_contract),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct EIP712TypedData<TTypes, TValue> {
    pub types: TTypes,

    pub domain: TypedDataDomain,

    pub value: TValue,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct EIP712TypedDataValueBase {
    pub nonce: u32,

    pub deadline: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePostEIP712TypedDataValue {
    pub profile_id: ProfileId,

    #[serde(rename = "contentURI")]
    pub content_uri: String,

    pub collect_module: Address,

    pub collect_module_init_data: Hex,

    pub reference_module: Address,

    pub reference_module_init_data: Hex,

    pub nonce: u64,

    pub deadline: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct CreatePostEIP712Types {
    #[serde(rename = "PostWithSig")]
    pub post_with_sig: Vec<Eip712DomainType>,
}

pub type CreatePostEIP712TypedData =
    EIP712TypedData<CreatePostEIP712Types, CreatePostEIP712TypedDataValue>;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCommentEIP712TypedDataValue {
    pub profile_id: ProfileId,

    pub profile_id_pointed: ProfileId,

    pub pub_id_pointed: PublicationId,

    #[serde(rename = "contentURI")]
    pub content_uri: String,

    pub reference_module: Address,

    pub collect_module: Address,

    pub collect_module_init_data: Hex,

    pub reference_module_init_data: Hex,

    pub reference_module_data: Hex,

    pub nonce: u64,

    pub deadline: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct CreateCommentEIP712Types {
    #[serde(rename = "CommentWithSig")]
    pub comment_with_sig: Vec<Eip712DomainType>,
}

pub type CreateCommentEIP712TypedData =
    EIP712TypedData<CreateCommentEIP712Types, CreateCommentEIP712TypedDataValue>;

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateMirrorEIP712TypedDataValue {
    pub profile_id: ProfileId,

    pub profile_id_pointed: ProfileId,

    pub pub_id_pointed: PublicationId,

    pub reference_module_data: Hex,

    pub reference_module: Address,

    pub reference_module_init_data: Hex,

    pub nonce: u64,

    pub deadline: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct CreateMirrorEIP712Types {
    #[serde(rename = "MirrorWithSig")]
    pub mirror_with_sig: Vec<Eip712DomainType>,
}

pub type CreateMirrorEIP712TypedData =
    EIP712TypedData<CreateMirrorEIP712Types, CreateMirrorEIP712TypedDataValue>;

pub trait TypedData {}
impl<T> TypedData for Box<T> where T: TypedData + ?Sized {}
impl TypedData for CreatePostEIP712TypedData {}
impl TypedData for CreateCommentEIP712TypedData {}
impl TypedData for CreateMirrorEIP712TypedData {}
