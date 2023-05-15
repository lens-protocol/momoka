use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::types::transaction::MomokaTxId;
use crate::types::verifier_error::MomokaVerifierError;

pub struct TransactionCacheResult {
    pub success: bool,
    pub error: Option<MomokaVerifierError>,
}

lazy_static::lazy_static! {
    static ref TRANSACTION_CACHE: RwLock<HashMap<MomokaTxId, Arc<TransactionCacheResult>>> = RwLock::new(HashMap::new());
    static ref SIGNATURE_CACHE: RwLock<HashMap<String, Arc<()>>> = RwLock::new(HashMap::new());
}

/// Reads a value from the transaction cache dictionary based on the given key.
///
/// # Arguments
///
/// * `key` - A momoka tx id slice representing the key to look up in the cache.
///
/// # Returns
///
/// An `Option` containing a reference to the value if the key is found in the cache, or `None` if the key is not present.
pub fn read_transaction_cache(key: &MomokaTxId) -> Option<Arc<TransactionCacheResult>> {
    TRANSACTION_CACHE.read().unwrap().get(key).cloned()
}

/// Sets a value in the transaction cache dictionary based on the given key.
///
/// # Arguments
///
/// * `key` - A momoka tx id representing the key to set in the cache.
/// * `value` - The value to associate with the key in the cache.
pub fn set_transaction_cache(key: MomokaTxId, value: TransactionCacheResult) -> () {
    let cache_value = Arc::new(value);
    TRANSACTION_CACHE.write().unwrap().insert(key, cache_value);
}

/// Reads a value from the signature cache dictionary based on the given key.
///
/// # Arguments
///
/// * `key` - A signature slice representing the key to look up in the cache.
///
/// # Returns
///
/// An `Option` containing a reference to the value if the key is found in the cache, or `None` if the key is not present.
pub fn read_signature_cache(key: &str) -> Option<Arc<()>> {
    SIGNATURE_CACHE.read().unwrap().get(key).cloned()
}

/// Sets a value in the signature cache dictionary based on the given key.
///
/// # Arguments
///
/// * `key` - A signature representing the key to set in the cache.
/// * `value` - The value to associate with the key in the cache.
pub fn set_signature_cache(key: String) -> () {
    let cache_value = Arc::new(());
    SIGNATURE_CACHE.write().unwrap().insert(key, cache_value);
}
