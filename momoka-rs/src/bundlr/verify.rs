use crate::types::{
    transaction::TransactionTimestampProofsValidation, verifier_error::MomokaVerifierError,
};
use bundlr_sdk::{
    deep_hash::DeepHashChunk, deep_hash_sync::deep_hash_sync, ArweaveSigner, Verifier,
};

use data_encoding::BASE64URL_NOPAD;

/// Verifies the timestamp proofs for a transaction.
///
/// This function takes a `TransactionTimestampProofsValidation` object, which contains the
/// timestamp proofs for a transaction, and verifies the signature of the proofs using Arweave's
/// verification algorithm. If the signature is invalid, this function returns an error.
///
/// # Examples
///
/// ```
/// use momoka_verifier::api::verify_timestamp_proofs;
/// use momoka_verifier::types::transaction::TransactionTimestampProofsValidation;
/// use momoka_verifier::verifier_error::MomokaVerifierError;
///
/// let tx_proofs = TransactionTimestampProofsValidation {
///     version: "1".into(),
///     id: "abc123".into(),
///     deadline_height: 100,
///     timestamp: 1620680199,
///     public_key: "key".into(),
///     signature: "sig".into(),
/// };
///
/// let result = verify_timestamp_proofs(&tx_proofs);
/// assert!(result.is_ok());
/// ```
pub async fn verify_timestamp_proofs(
    timestamp_proofs: &TransactionTimestampProofsValidation,
) -> Result<(), MomokaVerifierError> {
    let fields = DeepHashChunk::Chunks(vec![
        DeepHashChunk::Chunk("Bundlr".into()),
        DeepHashChunk::Chunk(timestamp_proofs.version.clone().into()),
        DeepHashChunk::Chunk(timestamp_proofs.id.clone().into()),
        DeepHashChunk::Chunk(timestamp_proofs.deadline_height.to_string().into()),
        DeepHashChunk::Chunk(timestamp_proofs.timestamp.to_string().into()),
    ]);

    let pubk = BASE64URL_NOPAD
        .decode(&timestamp_proofs.public_key.clone().into_bytes())
        .map_err(|_| MomokaVerifierError::TimestampProofInvalidSignature)?;

    let msg =
        deep_hash_sync(fields).map_err(|_| MomokaVerifierError::TimestampProofInvalidSignature)?;
    let sig = BASE64URL_NOPAD
        .decode(&timestamp_proofs.signature.clone().into_bytes())
        .map_err(|_| MomokaVerifierError::TimestampProofInvalidSignature)?;

    // Verify the signature using Arweave's verification algorithm
    ArweaveSigner::verify(pubk.into(), msg, sig.into())
        .map_err(|_| MomokaVerifierError::TimestampProofInvalidSignature)
}

#[cfg(test)]
#[tokio::test]
async fn test_verify_timestamp_proofs() {
    // Prepare the input
    let timestamp_proofs = TransactionTimestampProofsValidation {
            id: "1cgDW9R4aSFXYd2NuVHITPvXQbA13-nUQwS1fhL6R0g".to_string(),
            timestamp: 1682525560422,
            version: "1.0.0".to_string(),
            public_key: "sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek".to_string(),
            signature: "VwDTklBWgxilmvgwZnal6JvGwF0fKcPx3JqZ5TMo35jKVOEKyCR8czY82x0fYz_rRqeZc96DAJPtMeHaKK-p3Taw-WvEbX9vvDISTjaEQMEYAl1aeAQG-RzcmmB8Ac9a57-OXThDUa88lQPYRrRCu8pIMc1fa-CnBY9CxXJQLv8K1XbZ5L1Hsg97lF64c0wYsxD72svLsc-s9fUmAZ1aB3fpAVYSUgpxK5FPZI1dxFA_TjJSrVEBGUz_ODWho1ZPtGpLlkr81Z10WkaohTLPe-_CBEouLy6fDPCrE3MUUj_-F-OHtzRgK756MQreMxoDEZSXNI22E7CFRiyy_1Rbw4Ax2lu65JeedGnajGcTpTVPlV6UTJRo8kPm6Zo6O6nTqaiZCvnNcLmcOXhNWSSJXVX2zxHWo6kT3ffwKRPuawaNgXFmIDzznfEqg-7uVEByI2UxpD_pF74J44ZxKUurBl8vm6OM7zvyL86VNNTVjafy4Qi6Y45NNqfcbsQpkYfindz0gBWU64NktRE3qUsPce4pL8C1vifL3P7SGF8RLhKedPi52-BNaufRk_vmUlBcNpsvsBSECcCU9SLgY3cSaZekClnPCM2kPQjg5bAIvHr88WSnFwm2niQ8ZZSJPaEEy6qI0QrgXnYDidgbGeUvygeFKG-E2itlF3tBtvR4SlQ".to_string(),
            deadline_height: 1170647,
            block: 1170647,
            validator_signatures: vec![]
        };

    // Verify the timestamp proofs
    let _ = verify_timestamp_proofs(&timestamp_proofs).await.is_ok();
}
