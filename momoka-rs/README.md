# momoka_rs

This is the rust implementation of the momoka library. It is currently beta and still recommended you use the momoka-node for now. The rust library will be the main client in the future, the node and client verifier logic will always be supported and maintained so people can verify client side.

## Installing

```bash
$ cargo install momoka
```

## CLI

Usage: momoka [OPTIONS]

```bash
Options:
  -n <NODE>             The URL of the node
  -e <ENVIRONMENT>      The environment (e.g., "MUMBAI" or "POLYGON")
  -d <DEPLOYMENT>       The deployment (e.g., "PRODUCTION")
  -t <TX_ID>            The transaction ID to check proof for
  -r                    Flag indicating whether to perform a resync
  -h, --help            Print help
  -V, --version         Print version
```

## Usage CLI

It is easy to run the momoka verifier locally using cargo. You can do so by running the following commands:

### Verifying live transactions

```bash
$ momoka -n="YOUR_NODE"
```

This will start verifying any incoming momoka transactions live. You can also can specify to resync from transaction 1 by adding the `-r` flag (this needs a node which is paid and has a high rate limit).

### Verifying a single transaction

```bash
$ momoka -n="YOUR_NODE" -t="TX_ID"
```

### Running locally from source

It is easy to run the momoka verifier locally using cargo. You can do so by running the following command:

```bash
$ cargo run -- -n="YOUR_NODE" [-r] [-t="TX_ID"]
```
