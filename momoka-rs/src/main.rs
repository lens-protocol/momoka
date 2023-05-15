mod bundlr;
mod cache;
mod contracts;
mod environment;
mod evm;
mod http;
mod logger;
mod submitter;
mod types;
mod utils;
mod verifier;

use clap::{arg, Parser};
use environment::{Deployment, Environment};
use evm::ProviderContext;
use logger::Logger;
use std::collections::HashSet;
use std::process::exit;
use std::{str::FromStr, thread::sleep, time::Duration};
use tokio;
use types::transaction::MomokaTxId;
use verifier::proof::check_proof;

use crate::{
    bundlr::api::{get_bulk_transactions_ids_api, get_last_transaction_api},
    verifier::proof::check_proofs,
};

/// Creates a `ProviderContext` based on the provided parameters.
///
/// # Arguments
///
/// * `node_url` - The URL of the Ethereum node.
/// * `environment` - The environment name (optional). Defaults to "POLYGON" if not provided.
/// * `deployment` - The deployment name (optional). Defaults to "PRODUCTION" if not provided.
///
/// # Panics
///
/// This function panics if the provided environment or deployment values are invalid.
///
/// # Returns
///
/// A `ProviderContext` containing the configured environment, node provider, and deployment.
pub fn create_provider_context(
    node_url: String,
    environment: Option<String>,
    deployment: Option<String>,
) -> ProviderContext {
    let environment = environment.unwrap_or("POLYGON".to_string());

    let etherem_network = Environment::from_str(&environment).unwrap_or_else(|_| {
        Logger.error("Invalid value for ENVIRONMENT");
        exit(1);
    });

    let deployment = deployment.unwrap_or("PRODUCTION".to_string());

    let deployment = Deployment::from_str(&deployment).unwrap_or_else(|_| {
        Logger.error("Invalid value for DEPLOYMENT");
        exit(1);
    });

    ProviderContext {
        environment: etherem_network,
        node: evm::evm_provider(&node_url),
        deployment,
    }
}

/// Command line arguments for the momoka-rs program.
#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct Cli {
    /// The URL of the node.
    #[arg(short = 'n', value_name = "NODE")]
    node: Option<String>,

    /// The environment (e.g., "MUMBAI" or "POLYGON").
    #[arg(short = 'e', value_name = "ENVIRONMENT")]
    environment: Option<String>,

    /// The deployment (e.g., "PRODUCTION").
    #[arg(short = 'd', value_name = "DEPLOYMENT")]
    deployment: Option<String>,

    /// The transaction ID to check proof for.
    #[arg(short = 't', value_name = "TX_ID")]
    tx_id: Option<MomokaTxId>,

    /// Flag indicating whether to perform a resync.
    #[arg(short = 'r', value_name = "RESYNC")]
    resync: bool,
}

#[tokio::main]
async fn main() {
    Logger.info("                                                                                                                       
        MMMMMMMM               MMMMMMMM     OOOOOOOOO     MMMMMMMM               MMMMMMMM     OOOOOOOOO     KKKKKKKKK    KKKKKKK               AAA               
        M:::::::M             M:::::::M   OO:::::::::OO   M:::::::M             M:::::::M   OO:::::::::OO   K:::::::K    K:::::K              A:::A              
        M::::::::M           M::::::::M OO:::::::::::::OO M::::::::M           M::::::::M OO:::::::::::::OO K:::::::K    K:::::K             A:::::A             
        M:::::::::M         M:::::::::MO:::::::OOO:::::::OM:::::::::M         M:::::::::MO:::::::OOO:::::::OK:::::::K   K::::::K            A:::::::A            
        M::::::::::M       M::::::::::MO::::::O   O::::::OM::::::::::M       M::::::::::MO::::::O   O::::::OKK::::::K  K:::::KKK           A:::::::::A           
        M:::::::::::M     M:::::::::::MO:::::O     O:::::OM:::::::::::M     M:::::::::::MO:::::O     O:::::O  K:::::K K:::::K             A:::::A:::::A          
        M:::::::M::::M   M::::M:::::::MO:::::O     O:::::OM:::::::M::::M   M::::M:::::::MO:::::O     O:::::O  K::::::K:::::K             A:::::A A:::::A         
        M::::::M M::::M M::::M M::::::MO:::::O     O:::::OM::::::M M::::M M::::M M::::::MO:::::O     O:::::O  K:::::::::::K             A:::::A   A:::::A        
        M::::::M  M::::M::::M  M::::::MO:::::O     O:::::OM::::::M  M::::M::::M  M::::::MO:::::O     O:::::O  K:::::::::::K            A:::::A     A:::::A       
        M::::::M   M:::::::M   M::::::MO:::::O     O:::::OM::::::M   M:::::::M   M::::::MO:::::O     O:::::O  K::::::K:::::K          A:::::AAAAAAAAA:::::A      
        M::::::M    M:::::M    M::::::MO:::::O     O:::::OM::::::M    M:::::M    M::::::MO:::::O     O:::::O  K:::::K K:::::K        A:::::::::::::::::::::A     
        M::::::M     MMMMM     M::::::MO::::::O   O::::::OM::::::M     MMMMM     M::::::MO::::::O   O::::::OKK::::::K  K:::::KKK    A:::::AAAAAAAAAAAAA:::::A    
        M::::::M               M::::::MO:::::::OOO:::::::OM::::::M               M::::::MO:::::::OOO:::::::OK:::::::K   K::::::K   A:::::A             A:::::A   
        M::::::M               M::::::M OO:::::::::::::OO M::::::M               M::::::M OO:::::::::::::OO K:::::::K    K:::::K  A:::::A               A:::::A  
        M::::::M               M::::::M   OO:::::::::OO   M::::::M               M::::::M   OO:::::::::OO   K:::::::K    K:::::K A:::::A                 A:::::A 
        MMMMMMMM               MMMMMMMM     OOOOOOOOO     MMMMMMMM               MMMMMMMM     OOOOOOOOO     KKKKKKKKK    KKKKKKKAAAAAAA                   AAAAAAA
   ");

    Logger.info("Starting momoka verifier up...");

    let args = Cli::parse();

    // Check if a node URL is provided
    let node_url = match args.node {
        Some(url) => url,
        None => {
            Logger
                .warning("YOUR USING A FREE NODE, BUSY TIMES THINGS COULD FAIL DUE TO LOW RATE LIMITS ON THIS NODE.");
            if args.environment.as_ref().is_none() {
               "https://rpc.ankr.com/polygon".to_string()
            } else {
               let node = match args.environment.as_ref().unwrap().to_string().as_str() {
                    "MUMBAI" => "https://rpc.ankr.com/polygon_mumbai".to_string(),
                    "POLYGON" => "https://rpc.ankr.com/polygon".to_string(),
                    _ => {
                        Logger.error("Invalid value for ENVIRONMENT");
                        exit(1);
                    },
                };

                node
            }
        }
    };

    let provider_context = create_provider_context(node_url, args.environment, args.deployment);

    // Check if a single transaction ID is provided
    if let Some(tx_id) = args.tx_id {
        Logger.info("Checking proof for a single transaction...");
        if let Err(err) = check_proof(&tx_id, &provider_context).await {
            Logger.error(&format!("Proof check failed: {}", err));
            exit(1);
        }
        exit(0);
    }

    let mut end_cursor = None;
    if args.resync {
        Logger.info("Resyncing momoka verifier, this will start from the first ever transaction and validate them all...");
    } else {
        let last_transaction =
            get_last_transaction_api(&provider_context.environment, &provider_context.deployment)
                .await
                .unwrap();
        end_cursor = Some(last_transaction.cursor);
    }

    let mut init_complete = false;

    loop {
        match get_bulk_transactions_ids_api(
            &provider_context.environment,
            &provider_context.deployment,
            &end_cursor,
            // Fetch 1,000 at a time! We can extend this if desired.
            1,
        )
        .await
        {
            Ok(transactions) => {
                if transactions.is_none() {
                    if !init_complete {
                        Logger.info("Waiting for new momoka transactions...");
                    }
                    sleep(Duration::from_millis(100));
                    init_complete = true;
                    continue;
                }

                let transactions = transactions.unwrap();
                end_cursor = transactions.next;

                let result = check_proofs(
                    // remove any duplicates
                    &transactions
                        .tx_ids
                        .into_iter()
                        .collect::<HashSet<String>>()
                        .into_iter()
                        .collect(),
                    &provider_context,
                )
                .await;

                if let Err(err) = result {
                    Logger.error(&format!("Proof check failed: {}", err));
                    exit(1);
                }
            }
            Err(err) => {
                let message = err.to_string();
                println!("Momoka error: {}", message);
                sleep(Duration::from_millis(100));
            }
        }
    }
}
