use reqwest::Client;
use serde::de::DeserializeOwned;
use serde::Serialize;
use std::thread::sleep;
use std::time::Duration;

const MAX_RETRIES: i32 = 5;

/// Sends a POST request to the specified URL with a JSON-encoded body, and returns the response as a deserialized object.
///
/// # Arguments
///
/// * `url` - The URL to which the request will be sent.
/// * `body` - The body of the request, which will be JSON-encoded and sent as the request payload.
///
/// # Returns
///
/// The deserialized response object, if the request was successful.
///
/// # Errors
///
/// This function will return an error if the request fails for any reason, or if the response cannot be deserialized into the specified type.
///
/// # Example
///
/// ```
/// use momoka_verifier::calls::post_with_timeout;
/// use momoka_verifier::types::verifier_error::MomokaVerifierError;
///
/// #[derive(serde::Deserialize)]
/// struct ExampleResponse {
///     message: String,
///     value: i32,
/// }
///
/// async fn example_post_request() -> Result<ExampleResponse, MomokaVerifierError> {
///     let body = serde_json::json!({
///         "some_key": "some_value",
///         "another_key": 42,
///     });
///     let response = post_with_timeout::<ExampleResponse, _>("http://example.com/api/endpoint", &body).await?;
///     Ok(response)
/// }
/// ```
pub async fn post_with_timeout<TResponse, TBody>(
    url: &str,
    body: &TBody,
) -> Result<TResponse, reqwest::Error>
where
    TBody: Serialize,
    TResponse: DeserializeOwned,
{
    let mut retries = 0;

    loop {
        match post_request(url, body).await {
            Ok(response) => return Ok(response),
            Err(err) => {
                if retries >= MAX_RETRIES {
                    return Err(err);
                }
                // sleep for 100ms and go again
                sleep(Duration::from_millis(100));
                retries += 1;
            }
        }
    }
}

/// Performs a POST request with a timeout and JSON body serialization.
///
/// # Arguments
///
/// * `url` - The URL to send the POST request to.
/// * `body` - The body of the request, to be serialized as JSON.
///
/// # Returns
///
/// A `Result` containing the deserialized response if the request is successful, or an `Error` if an error occurs.
async fn post_request<TResponse, TBody>(
    url: &str,
    body: &TBody,
) -> Result<TResponse, reqwest::Error>
where
    TBody: serde::Serialize,
    TResponse: serde::de::DeserializeOwned,
{
    let client = Client::new();

    let response = client
        .post(url)
        .timeout(Duration::from_millis(10000))
        .header("Content-Type", "application/json")
        .json(body)
        .send()
        .await?;

    response.json().await
}
