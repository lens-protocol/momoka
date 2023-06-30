use crate::{
    environment::{Deployment, Environment},
    http::post_with_timeout,
    submitter::state::get_submitters,
    types::{
        transaction::{
            MomokaTransaction, MomokaTransactionName, MomokaTxId, TimestampProofsResponse,
            TimestampProofsSummary, TransactionError, TransactionSummary,
        },
        verifier_error::MomokaVerifierError,
    },
};
use base64::{engine::general_purpose, Engine};
use ethers::{types::Address, utils};
use gql_client::Client;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, str::FromStr};

/// An enum representing various Bundlr endpoints.
enum BundlrEndpoint {
    GraphQl,
    BulkTxsData,
}

impl BundlrEndpoint {
    /// Get the URL of the endpoint.
    ///
    /// # Returns
    ///
    /// * A string slice containing the URL of the endpoint.
    pub fn url(&self) -> &str {
        match self {
            BundlrEndpoint::GraphQl => "https://lens.bundlr.network/graphql",
            BundlrEndpoint::BulkTxsData => "https://lens.bundlr.network/bulk/txs/data",
        }
    }
}

/// A bundlr transaction.
///
/// This struct holds the edges and page information of the momoka transactiond
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct BundlrTransactions {
    /// The edges of the bundlr transaction
    pub edges: Vec<BundlrTransactionEdge>,

    /// The page information of the bundlr transaction
    #[serde(rename = "pageInfo")]
    pub page_info: BundlrTransactionPageInfo,
}

/// A bundlr edge transaction.
///
/// This struct holds the edges and page information of the momoka transactiond
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct BundlrTransactionEdge {
    /// The node of the bundlr transaction (this is the address which did the action)
    pub node: BundlrTransactionNode,

    /// The cursor of the bundlr transaction
    pub cursor: String,
}

/// A bundlr node transaction.
///
/// This struct holds the node transaction information
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct BundlrTransactionNode {
    /// The id of the bundlr transaction
    pub id: String,

    /// The address of the bundlr transaction
    pub address: String,
}

/// A bundlr transaction page information.
///
/// This struct holds the page information of the bundlr transaction
/// and information allowing you to go to the next page
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct BundlrTransactionPageInfo {
    /// If their is more transactions
    #[serde(rename = "hasNextPage")]
    pub has_next_page: bool,

    /// The end cursor of the bundlr transactions for this page
    #[serde(rename = "endCursor")]
    pub end_cursor: Option<String>,
}

/// API response for getting momoka transactions from Bundlr.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct TransactionsAPIResponse {
    pub transactions: BundlrTransactions,
}

/// Represents the order direction for sorting.
#[derive(Debug, Clone, Copy)]
pub enum TransactionOrder {
    Ascending,
    Descending,
}

/// Constructs the GraphQL query to fetch data availability transactions.
///
/// # Arguments
///
/// * `owners` - A vector of addresses representing the owners to query transactions for.
/// * `limit` - The maximum number of transactions to retrieve.
/// * `after` - An optional cursor indicating the starting point for pagination.
///
/// # Returns
///
/// The constructed GraphQL query as a string.
fn get_transactions_query(
    owners: Vec<Address>,
    limit: i32,
    after: &Option<String>,
    order: TransactionOrder,
) -> String {
    let after_value = match after {
        Some(value) => format!("\"{}\"", value),
        None => "null".to_string(),
    };

    let order_value = match order {
        TransactionOrder::Ascending => "ASC",
        TransactionOrder::Descending => "DESC",
    };

    let owner_addresses: Vec<String> = owners
        .iter()
        .map(|address| utils::to_checksum(address, None))
        .collect();

    format!(
        r#"query DataAvailabilityTransactions {{
            transactions(owners: {:?}, limit: {}, after: {}, order: {}, hasTags: true) {{
                edges {{
                    node {{
                        id
                        address
                    }}
                    cursor
                }}
                pageInfo {{
                    endCursor
                    hasNextPage
                }}
            }}
        }}"#,
        owner_addresses, limit, after_value, order_value
    )
}

/// Get transactions from bundlr
///
/// # Examples
///
/// ```
/// let result = get_transactions_api(5);
/// ```
pub async fn get_transactions_api(
    environment: &Environment,
    deployment: &Deployment,
    limit: i32,
    end_cursor: &Option<String>,
    order: TransactionOrder,
) -> Result<TransactionsAPIResponse, MomokaVerifierError> {
    let submitters = get_submitters(environment, deployment);
    let query = get_transactions_query(submitters, limit, end_cursor, order);

    let client = Client::new(BundlrEndpoint::GraphQl.url());
    let response = client
        .query::<TransactionsAPIResponse>(&query)
        .await
        .map_err(|_e| MomokaVerifierError::CannotConnectToBundlr)?;

    Ok(response.unwrap())
}

/// API response for grabbing bulk transactions from momoka.
#[derive(Debug, Clone, PartialEq, Eq, Deserialize, Serialize)]
pub struct BulkTransactionsIdsAPIResponse {
    pub next: Option<String>,
    pub tx_ids: Vec<String>,
}

/// Retrieves the ID of the last transaction using the specified environment and deployment.
///
/// # Arguments
///
/// * `environment` - A reference to the `Environment` enum representing the environment.
/// * `deployment` - A reference to the `Deployment` enum representing the deployment.
///
/// # Returns
///
/// A `Result` containing the ID of the last transaction as a `String` if successful, or a `MomokaVerifierError` if an error occurs.
pub async fn get_last_transaction_api(
    environment: &Environment,
    deployment: &Deployment,
) -> Result<BundlrTransactionEdge, MomokaVerifierError> {
    let response = get_transactions_api(
        environment,
        deployment,
        1,
        &None,
        TransactionOrder::Descending,
    )
    .await?
    .transactions;

    let edge = response
        .edges
        .first()
        .ok_or(MomokaVerifierError::NoLastTransactionFound)?;

    // always the first one as we doing limit 1
    Ok(edge.to_owned())
}

/// Retrieves a bulk of transaction ids from Momoka, up to a maximum number of pulls.
///
/// This function pulls transactions from Momoka until either the maximum number of pulls is reached,
/// or there are no more transactions to pull. The result is returned as an optional bulk transactions
/// API response, which contains the transaction IDs and a cursor for pagination.
///
/// # Arguments
///
/// * `environment` - The environment to use for the API request.
/// * `deployment` - The deployment to use for the API request.
/// * `end_cursor` - The cursor for pagination, indicating where to start pulling transactions from.
/// * `max_pulling` - The maximum number of pulls to perform.
///
/// # Examples
///
/// ```
/// let response = get_bulk_transactions_ids_api(Environment::Production, Deployment::Mainnet, None, 5).await.unwrap();
/// assert_eq!(response.tx_ids.len(), 15);
/// ```
pub async fn get_bulk_transactions_ids_api(
    environment: &Environment,
    deployment: &Deployment,
    end_cursor: &Option<String>,
    max_pulling: usize,
) -> Result<Option<BulkTransactionsIdsAPIResponse>, MomokaVerifierError> {
    let mut result = BulkTransactionsIdsAPIResponse {
        next: end_cursor.clone(),
        tx_ids: vec![],
    };

    for _ in 0..max_pulling {
        let response = get_transactions_api(
            environment,
            deployment,
            1000,
            &result.next,
            TransactionOrder::Ascending,
        )
        .await?
        .transactions;

        if response.edges.is_empty() {
            break;
        }

        let tx_ids = response
            .edges
            .into_iter()
            .map(|edge| edge.node.id)
            .collect::<Vec<_>>();

        result.next = response.page_info.end_cursor;
        result.tx_ids.extend(tx_ids);

        if result.next.is_none() {
            break;
        }
    }

    Ok(if result.tx_ids.is_empty() {
        None
    } else {
        Some(result)
    })
}

/// Bundlr transaction in base 64 format aka the data
#[derive(Debug, Deserialize)]
pub struct BundlrTransactionBase64 {
    pub id: String,
    pub address: Address,
    pub data: String,
}

/// Bundlr bulk transactions response
#[derive(Debug, Deserialize)]
pub struct BundlrBulkTransactionsResponse<TSuccess> {
    pub success: Vec<TSuccess>,
    pub failed: std::collections::HashMap<MomokaTxId, MomokaVerifierError>,
}

/// Fetches a bulk set of transactions from the Bundlr node and returns the result as a `BundlrBulkTransactionsResponse` containing base64-encoded transaction data.
///
/// # Arguments
///
/// * `tx_ids` - A slice of `String` objects representing the IDs of the transactions to fetch.
///
/// # Errors
///
/// Returns a `MomokaVerifierError` if there is an error connecting to the Bundlr node or if the response is invalid.
///
/// # Examples
///
/// ```
/// use crate::types::transaction::BundlrTransactionBase64;
///
/// let tx_ids = vec![
///     "PoDx9KfHCIKAdJg2WyfWcx2B_K5aMKq0je7EtIcOc4w",
///     "HoDx9KfHCIKAdJg2WyfWcx2B_K5aMKq0je7EtIcOc4w",
///     "LoDx9KfHCIKAdJg2WyfWcx2B_K5aMKq0je7EtIcOc4w",
/// ];
///
/// let response = get_bulk_transactions_base_64_api(&tx_ids).await?;
///
/// assert_eq!(response.transactions.len(), tx_ids.len());
/// for tx in response.transactions {
///     println!("Transaction: {:?}", tx);
/// }
/// ```
async fn get_bulk_transactions_base_64_api(
    tx_ids: &[String],
) -> Result<BundlrBulkTransactionsResponse<BundlrTransactionBase64>, MomokaVerifierError> {
    post_with_timeout(BundlrEndpoint::BulkTxsData.url(), &tx_ids.to_vec())
        .await
        .map_err(|_| MomokaVerifierError::CannotConnectToBundlr)
}

/// Decodes the base64-encoded `data` field of each `BundlrTransactionBase64`
/// struct in the `results` vector, applies the provided closure to the decoded
/// `String`, and collects the results into a vector of `TResult`.
///
/// # Arguments
///
/// * `results` - A vector of `BundlrTransactionBase64` structs to process.
/// * `builder` - A closure that accepts a `String` argument and returns a `TResult`.
///
/// # Returns
///
/// A `Result` containing a vector of `TResult` if the decoding and processing was
/// successful, or a `MomokaVerifierError` if an error occurred.
///
/// # Example
///
/// ```rust
/// use my_crate::{from_base_64, BundlrTransactionBase64};
///
/// fn my_builder(s: &String) -> u32 {
///     s.len() as u32
/// }
///
/// let results = vec![
///     BundlrTransactionBase64 { data: "aGVsbG8=".to_owned() },
///     BundlrTransactionBase64 { data: "d29ybGQ=".to_owned() },
/// ];
///
/// let res = from_base_64(results, my_builder);
///
/// assert_eq!(res.unwrap(), vec![5, 4]);
/// ```
///
async fn from_base_64<TResult>(
    results: &Vec<BundlrTransactionBase64>,
    builder: fn(&str, reference: &BundlrTransactionBase64) -> TResult,
) -> Result<Vec<TResult>, MomokaVerifierError> {
    let mut batch_result: Vec<TResult> = Vec::new();

    let mut tasks = Vec::new();
    for result in results {
        let task = async move {
            let decoded = general_purpose::STANDARD
                .decode(&result.data)
                .map_err(|_| MomokaVerifierError::InvalidTransactionFormat)?;

            let transaction = String::from_utf8(decoded)
                .map_err(|_| MomokaVerifierError::InvalidTransactionFormat)?;

            let result = builder(&transaction, result);

            Ok(result)
        };

        tasks.push(task);
    }

    let batch_results = futures::future::try_join_all(tasks).await?;

    batch_result.extend(batch_results);

    Ok(batch_result)
}

/// Constructs a `TransactionSummary` from a decoded transaction string and a `BundlrTransactionBase64` reference.
///
/// # Arguments
///
/// * `decoded_transaction` - A string containing the decoded transaction data.
/// * `reference` - A `BundlrTransactionBase64` reference containing metadata about the transaction.
///
/// # Errors
///
/// Returns a `MomokaVerifierError` if the decoded transaction data is invalid or if there is an error
/// parsing the transaction type from the JSON data.
///
/// # Returns
///
/// Returns a `TransactionSummary` struct containing information about the transaction.
///
fn transaction_builder(
    decoded_transaction: &str,
    reference: &BundlrTransactionBase64,
) -> Result<TransactionSummary, TransactionError> {
    // Parse the decoded transaction data into a JSON value.
    let json_value: serde_json::Value =
        serde_json::from_str(decoded_transaction).map_err(|_| {
            TransactionError::new(
                reference.id.clone(),
                MomokaVerifierError::InvalidTransactionFormat,
            )
        })?;

    // Get the transaction type from the JSON data and parse it into a `TransactionType` enum.
    let transaction_type = MomokaTransaction::from_json(
        decoded_transaction,
        &MomokaTransactionName::from_str(json_value["type"].as_str().unwrap()).map_err(|_| {
            TransactionError::new(
                reference.id.clone(),
                MomokaVerifierError::InvalidTransactionFormat,
            )
        })?,
    )
    .map_err(|e| TransactionError::new(reference.id.clone(), e))?;

    // Construct a `TransactionSummary` struct from the transaction data.
    let transaction_summary = TransactionSummary {
        id: reference.id.to_owned(),
        submitter: reference.address.to_owned(),
        momoka_tx: transaction_type,
        // For now, we do not have the response from the timestamp proofs.
        timestamp_proofs_response: None,
        pointer_transaction_summary: None,
    };

    // Return the `TransactionSummary` struct.
    Ok(transaction_summary)
}

/// Constructs a `TimestampProofsResponse` from a decoded transaction string and a `BundlrTransactionBase64` reference.
///
/// # Arguments
///
/// * `decoded_transaction` - A string containing the decoded transaction data.
/// * `reference` - A `BundlrTransactionBase64` reference containing metadata about the transaction.
///
/// # Errors
///
/// Returns a `MomokaVerifierError` if the decoded transaction data is invalid.
///
/// # Returns
///
/// Returns a `TimestampProofsResponse` struct containing the transaction's timestamp proofs.
///
fn transaction_timestamp_proofs_builder(
    decoded_transaction: &str,
    reference: &BundlrTransactionBase64,
) -> Result<TimestampProofsSummary, TransactionError> {
    // Parse the decoded transaction data into a `TimestampProofsResponse` struct.
    let response =
        serde_json::from_str::<TimestampProofsResponse>(decoded_transaction).map_err(|_| {
            TransactionError::new(
                reference.id.clone(),
                MomokaVerifierError::InvalidTransactionFormat,
            )
        })?;

    Ok(TimestampProofsSummary {
        id: reference.id.to_owned(),
        response,
    })
}

/// Retrieves a single transaction using its ID.
///
/// This method retrieves a single transaction specified by its ID. It internally calls the
/// `get_bulk_transactions_api` method with a slice containing the single transaction ID.
///
/// # Arguments
///
/// * `tx_id` - A `&MomokaTxId` representing the ID of the transaction to retrieve.
///
/// # Returns
///
/// A `Result` containing the retrieved `TransactionSummary` if successful, or an error of type
/// `MomokaVerifierError` if the retrieval fails.
pub async fn get_transaction_api(
    tx_id: &MomokaTxId,
) -> Result<TransactionSummary, MomokaVerifierError> {
    let tx_ids = vec![tx_id.to_owned()];
    let mut result = get_bulk_transactions_api(&tx_ids).await?;
    let single_transaction = result
        .success
        .pop()
        .ok_or(MomokaVerifierError::CannotConnectToBundlr)?;
    Ok(single_transaction)
}

// Define a constant chunk size
pub const CHUNK_SIZE: usize = 1000;

/// Retrieves bulk transactions and their corresponding timestamp proofs from the API
///
/// This function takes a slice of transaction IDs, retrieves the transactions in chunks
/// from the API, decodes them, retrieves the timestamp proofs for the successful transactions,
/// and updates the corresponding transaction summaries with the timestamp proofs.
///
/// # Arguments
///
/// * `tx_ids` - A slice of transaction IDs
///
/// # Returns
///
/// A result containing the bulk transactions response, which includes the successfully retrieved
/// and updated transaction summaries, or an error of type `MomokaVerifierError`.
///
/// # Example
///
/// ```rust
/// use my_crate::get_bulk_transactions_api;
///
/// async fn my_function() {
///     let tx_ids = vec!["id1".to_owned(), "id2".to_owned()];
///     let result = get_bulk_transactions_api(&tx_ids).await;
///     match result {
///         Ok(response) => {
///             // Process the successful response
///             println!("Success: {:?}", response.success);
///         }
///         Err(error) => {
///             // Handle the error
///             println!("Error: {:?}", error);
///         }
///     }
/// }
/// ```
pub async fn get_bulk_transactions_api(
    tx_ids: &[MomokaTxId],
) -> Result<BundlrBulkTransactionsResponse<TransactionSummary>, MomokaVerifierError> {
    let mut combined_response = BundlrBulkTransactionsResponse::<TransactionSummary> {
        success: vec![],
        failed: HashMap::new(),
    };

    let mut futures = vec![];
    for tx_ids_chunk in tx_ids.chunks(CHUNK_SIZE) {
        let fut = async move {
            let transactions_base_64 = get_bulk_transactions_base_64_api(tx_ids_chunk).await?;

            let mut transactions =
                from_base_64(&transactions_base_64.success, transaction_builder).await?;

            let timestamp_proofs_transaction_ids = transactions
                .iter()
                .filter_map(|tx_result| {
                    tx_result.as_ref().ok().map(|tx_summary| {
                        tx_summary
                            .momoka_tx
                            .get_timestamp_proofs()
                            .unwrap()
                            .response
                            .id
                            .to_owned()
                    })
                })
                .collect::<Vec<_>>();

            let transactions_timestamp_proofs_base64 =
                get_bulk_transactions_base_64_api(&timestamp_proofs_transaction_ids)
                    .await?
                    .success;

            let transaction_timestamp_proofs = from_base_64(
                &transactions_timestamp_proofs_base64,
                transaction_timestamp_proofs_builder,
            )
            .await?;

            for (tx_summary, tx_proofs_result) in transactions
                .iter_mut()
                .filter_map(|tx_result| tx_result.as_mut().ok())
                .zip(transaction_timestamp_proofs.into_iter())
            {
                if let Ok(tx_proofs) = tx_proofs_result {
                    let id = &tx_summary.momoka_tx.get_timestamp_proofs()?.response.id;

                    // should not happen but lets panic just incase
                    assert_eq!(*id, tx_proofs.id);
                    tx_summary.set_timestamp_proofs_response(tx_proofs.response);
                }
            }

            Ok(transactions)
        };
        futures.push(fut);
    }

    let results = futures::future::try_join_all(futures).await?;
    for result in results.into_iter().flatten() {
        match result {
            Ok(tx) => combined_response.success.push(tx),
            Err(tx_error) => {
                combined_response.failed.insert(tx_error.id, tx_error.error);
            }
        }
    }

    Ok(combined_response)
}
