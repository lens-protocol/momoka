use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::types::verifier_error::MomokaVerifierError;

pub struct CacheResult {
    pub success: bool,
    pub error: Option<MomokaVerifierError>,
}

lazy_static::lazy_static! {
    static ref CACHE: RwLock<HashMap<String, Arc<CacheResult>>> = RwLock::new(HashMap::new());
}

/// Reads a value from the cache dictionary based on the given key.
///
/// # Arguments
///
/// * `key` - A string slice representing the key to look up in the cache.
///
/// # Returns
///
/// An `Option` containing a reference to the value if the key is found in the cache, or `None` if the key is not present.
pub fn read_cache(key: &str) -> Option<Arc<CacheResult>> {
    CACHE.read().unwrap().get(key).cloned()
}

/// Sets a value in the cache dictionary based on the given key.
///
/// # Arguments
///
/// * `key` - A string slice representing the key to set in the cache.
/// * `value` - The value to associate with the key in the cache.
pub fn set_cache(key: String, value: CacheResult) {
    let cache_value = Arc::new(value);
    CACHE.write().unwrap().insert(key, cache_value);
}
