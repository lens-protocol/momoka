IN _README to stop people seeing it

# Bonsai

## Disclaimer 

We would like to emphasize that this project is currently in its beta phase and incorporates new, innovative technology. As with any cutting-edge solution, there may be potential challenges or undiscovered issues that could arise during its initial stages. We are committed to continually refining and improving our offering, and we appreciate your understanding and patience as we work diligently to perfect this technology. Please feel free to provide feedback or report any issues, as your input is invaluable in helping us enhance the user experience and overall functionality of our project.

# Bonsai Verifier

The Bonsai Verifier enables you to operate a trustless verifier node that validates LENS DA publications in real-time. Additionally, it can serve as an indexer, allowing you to stream and index the data yourself. This open-source solution relies exclusively on software that you can run independently, without any dependency on LENS. This ensures that even if LENS were to cease operation, you would retain access to your content, maintain proof of ownership, and continue to utilize it, all thanks to a decentralized data availability storage layer.

For information on how to run this software, please refer to the [How to run](#running) section.

## What is Bonsai technical definition? 

Bonsai, a term we've due to lens brand, refers to an Optimistic L3 - a hybrid by taking best from both - Optimistic Rollups and L3 technologies. We've chosen this approach for several reasons:

- Optimistic Rollup is a technique that processes transactions off-chain for enhanced scalability and reduced fees. It typically compresses these transactions back to the main chain, but we've excluded this final step in our implementation.
- L3, while having various definitions, generally involves technology built on top of Layer 2 (L2). Despite some considering Polygon a combination of side-chain and L2, we utilize the Polygon EVM chain to enable transaction proofs, improving the user experience (UX/UI) and overall experience for LENS users. This is why we designate it as L3.

We describe Bonsai long form name as an "Optimistic Hybrid-settlement L3" because, in most cases, settlement refers to both storage and verification. However, in this instance, the storage layer is provided by the Data Availability (DA) provider, and the settlement, or proof verification, is conducted using the Polygon chain.

As we continue to refine this technology, the technical name may evolve, but we wanted to clarify the rationale behind the current terminology.

## What is DA?

DA stands for Data Availability. It refers to the concept of storing data in a decentralized availability layer, which is more cost-effective than storing it on an EVM chain. The DA has no latency, meaning the data is produced and queryable instantly, in contrast to IPFS and EVM chains, which always have latency until they are considered complete. We utilize Arweave and Bundlr for this purpose. Arweave is a decentralized, permanent storage network with over 100 nodes in operation (as writing this documentation); it is being increasingly adopted by various NFT projects. Bundlr enhances Arweave's scalability while providing DA guarantees, enabling the use of EVM wallets to save DA logic and serving as a tool to rapidly push data to Arweave. DA can be used to store actions like posts, comments, mirrors, and more; initially, we are focusing on publications. The goal is to keep the DA layer affordable and scalable while still verifying transactions on Polygon using EVM simulations. DA requires a one-time payment for data storage and is backed by mathematical and hardware history guarantees.

Using this software, you can verify that a particular action would have been executed on-chain. The approach involves performing the same signing actions as you would on an EVM chain, but without actually sending the transaction (which consumes gas to store in the EVM state). Instead, you create a DA standard and save it on a DA layer, complete with proofs and all the required information. This enables ANYONE to cross-check the data, providing 100% proof that the action must have been performed by someone capable of creating the transaction signature and submitting it. This can be demonstrated by simulating the transaction. This approach allows LENS to scale while maintaining the core values of "ownership" and "trust" provided by the blockchain.

## Why do we need to use DA?

EVM can store state indefinitely, but at a cost; blockchains were designed for trustless transactional systems. EVM is secured by the network and mined into the chain; the data on-chain is immutable and verifiable at any time, ensuring trust. However, storing data on-chain is expensive, and EVM machines can only process a limited number of transactions per block based on maximum gas limits. Polygon is a shared block space; and at the moment has challenges scaling beyond 50-100 TPS. With 2-second block times, some latency is unavoidable, and max gas limits per block make scaling challenging, if not impossible. For context, Twitter experiences peak rates of 25,000 TPS; while LENS may not require this level of capacity yet, scalability is a critical consideration. This is where DA layers come in; they offer a more affordable solution for storing data with a one-time payment, backed by mathematical guarantees and a history of decreasing hardware costs over time. Moreover, these DA layers are decentralized, preserving this aspect of the system. DA enables scalability beyond 25,000 TPS, and even more; if we aim to revolutionize the world of core social ownership, we must be able to scale accordingly.

## What are transactions on EVM machines?

A transaction on an EVM machine alters some form of state; it is signed by the wallet's private key and then transmitted to the network. The network verifies the signature and executes the transaction, which contains logic that can either succeed or revert. If the transaction reverts, it is not included in the new block; if it succeeds, it is incorporated into the new block and confirmed by other miners. Miners are incentivized to perform these confirmations. This process ensures that transactions cannot be "faked," as they require a valid signature from a trusted key. Furthermore, a transaction can only succeed or revert—nothing more, nothing less. As the EVM progresses block by block and updates the state each time, it raises the question: what if you performed all steps of a transaction, except actually sending it, for actions that don't involve transferring funds or trustless executions?

## How can DA and EVM work together?

LENS is deployed on Polygon, an EVM-based platform. All actions—such as posts, comments, mirrors, follows, and collects are transactions that are built, signed, and sent to be stored on the EVM machine. In the new system, transactions are still built and require a signature from a wallet that would pass the state on-chain, but they are not actually sent. Instead, the transaction signature and typed data are used to create DA metadata, which is then transmitted to a DA layer containing information such as block number, signed typed data, transaction signature, and other crucial details. This data is structured in a way that can be fully verified with just having an archive node.

EVM machines function as large state machines. The EVM JSON-RPC methods allow you to simulate transactions using `eth_call`, determining the outcome of a transaction without actually sending it. You can specify a block number to run the simulation and use the signed typed data transaction with the typed data. This can be done with every `withSig` method on the LENS contracts. With just a Polygon node, anyone can verify that the data on the DA layer is accurate and would have been valid at that point in time. Since the typed data contains expiry times and nonces, it can be proven in a secure manner and can not be submitted by anyone else.

The advantage of this approach is that the data is stored on a decentralized layer, meaning that no centralized entity controls the content. Users retain ownership of their publications, and if any part of LENS were to disappear, all the data would remain verifiable, accessible, and usable by anyone. This demonstrates the power of decentralization, ensuring that users' data cannot be taken away from them.

## What does this mean?

This approach allows LENS to scale to a lot higher TPS, which is currently unattainable with an EVM chain, while also providing a more cost-effective solution. This can be achieved without compromising the core ownership of the social graph, and the indexing process remains familiar for app developers. Using this system is optional; those who prefer can continue to store everything on Polygon. However, if a publication doesn't require the power of a trustless execution layer, there's no need to use the EVM state.

## Bonsai vs polygon side by side

Here are diagrams that show how a transaction would look like on Polygon versus a transaction using the DA layer. These diagrams are meant to provide a simplified high-level overview of how the transactions work, while more detailed information is provided below with all the necessary technical details.

### Polygon

<img src="https://statics-polygon-lens.s3.eu-west-1.amazonaws.com/polygon-transaction.png">

### Bonsai

<img src="https://statics-polygon-lens.s3.eu-west-1.amazonaws.com/da-transaction.png">

## Bonsai Submitters

To maintain trust, submitters must be held accountable for their actions and face potential penalties for misconduct. Initially, the submitter whitelist will consist of a single address owned by LENS. As the approach is proven, the system can be expanded to allow anyone to become a submitter, with incentives for good behavior and penalties for bad actors. If submitters have nothing to lose, they could flood the system with invalid submissions, overwhelming verifiers and causing delays. During the beta phase, LENS will be responsible for correcting any errors, with bug bounties planned for the post-beta period. Ultimately, the goal is to have multiple submitters contributing to the system. It's important to note that certain errors, such as `UNKNOWN`, `CAN_NOT_CONNECT_TO_BUNDLR`, `BLOCK_CANT_BE_READ_FROM_NODE`, `DATA_CANT_BE_READ_FROM_NODE`, and `SIMULATION_NODE_COULD_NOT_RUN`, `POTENTIAL_REORG` are related to third-party software issues and not considered critical verifier errors. The verifier will retry these errors later to see if they still pass. Over time, the entire system could become decentralized. For now, this beta approach represents the first attempt at scaling using a hybrid module model.

## Bonsai Submitters' responsibilities

Submitters are responsible for validating, building up DA metadata, and submitting it to Arweave/Bundlr. After generating proofs with the DA submission, the data is uploaded to Arweave via Bundlr, with an instantaneous response. The submitter must provide proofs that anyone can contest. Verifier software listens for DA publications sent from whitelisted submitter addresses and verifies their validity.

## Bonsai Verifiers

Verifiers are tasked with monitoring DA publications from submitters and confirming their validity. They must follow specific criteria when evaluating incoming publications, with the primary goal of ensuring the submitter is truthful. Anyone can run a verifier using open-source software and a few commands. The verifier utilizes LevelDB for quick storage of passed results. The code has the capability to use a forked archive node with Foundry's `anvil` for local machine execution. However, for optimal speed, it is recommended to use an archive node directly (Alchemy is suggested but not required). All that's needed to run a verifier is an archive node.

## Bonsai Current limitations with DA publications

- DA publications must use the `RevertCollectModule` and no `ReferenceModule`. This will be addressed in a future release.
- For now, DA comments can only be added to other DA publications; they cannot be mixed. This limitation will be explored after the v1 launch.
- DA mirrors can only mirror DA publications, not Polygon publications. This issue will be addressed post-v1 launch.
- While it's not possible to prove DA publications on other DA publications on Polygon (as they are not on-chain), it's still possible to verify the signatures and transactions as valid. However, simulations cannot be executed in this scenario.
- When verifying a submission, the pointer is checked as well. Only the first pointer is checked, not unlimited pointers, as the other verifications would have been done by the verifier.

## Compatibility with signature-free transactions

A top-class UX is essential for LENS users. DA publications work with the dispatcher, which can post, mirror, or comment on users' behalf. If enabled, this will pass state checks. The LENS contract logic states that if the dispatcher signs on behalf of the user, it will result in a valid transaction. Users who don't want to trust the dispatcher can still sign the typed data with their wallet and submit it through the submitter. This process is similar to the current flow, but the transaction is sent to a submitter instead of a Polygon node.

## Gasless transactions

DA operations don't require gas, making them free to use. The app still needs to upload the contentURI to a resolvable location, the submitter pays for storage of DA metadata on Arweave/Bundlr, which is significantly cheaper than EVM gas prices (up to 1000x cheaper).

## Timestamp proofs for picking the block number

You might be concerned that a submitter could deceive about which block to submit on, but that's where Bundlr timestamp proofs come into play. In addition, each signature has a deadline that corresponds to the timestamp of an already mined block, rendering the signature invalid if sent. Bundlr enables you to request a timestamp proof that returns the current timestamp while storing it, allowing anyone to verify that the time was generated by them. This becomes our source of truth for determining the appropriate block number to use; we should use the block number closest to the timestamp generated by Bundlr. It's important to note that latency will inevitably occur due to node software, so if it selects a block number and, upon verification, it is one behind, we consider this an acceptable threshold.

## Handling reorgs

A reorg on the EVM chain occurs when the blockchain structure changes, often due to a consensus failure or attack. This can lead to previously confirmed transactions becoming unconfirmed, and vice versa. It has significant security implications, making it crucial to be aware of the potential for reorgs and take measures to mitigate their impact. Developers at Polygon and other organizations working on EVM software are striving to reduce the frequency and depth of reorgs, making the issue less concerning. As a general precaution, waiting before considering a transaction final, much like how centralized exchanges operate, is the safest approach - the longer the wait, the lower the risk of a reorg affecting the transaction. In Bonsai's first beta version, users cannot mix DA actions with EVM on-chain actions, which was implemented intentionally to simplify handling reorgs.

Currently, the validator doesn't recheck proofs once they are validated, as its primary objective is to validate as quickly as possible for the initial proof. However, as we start integrating DA actions with EVM on-chain actions, we will need to incorporate reorg handling and enable the verifier to recheck intelligently.

For now, any reorg handling or rechecking must be performed outside of the validator software. For example, the LENS API also monitors reorgs and re-validates proofs if a reorg affects any DA actions.

If a transaction is part of a reorg and ends up in a different block or not included at all, the proofs should be re-validated using the new blockchain state, ensuring their validity despite the reorg.

As we are not mixing and matching actions we remove a lot of the issues but not all, the edge cases that could cause issues are situations where for example someone sets a dispatcher and then straight away performs an DA action that has the dispatcher sign on their behalf, and then a reorg follows. If the transaction which adds the dispatcher to the profile is not resubmitted or is resubmitted at a higher block number, the proofs would fail. In that case, rerunning the proofs would return a `POTENTIAL_REORG` error which is not "bad" in terms of a submitter doing wrong as they could not of predicted it, you can handle this then as needed. Once we start integrating the cross actions, we will handle such cases within the validator.

## DA publication metadata

We will show you a few examples of the `DA` metadata and then explain each field.

### Post example

```js
{
  signature:
    '0x87866d620636f62aa3930d8c48be37dac77f96f30a9e06748491934fef75e7884a193d59fc486da3ea35f991bbd37a04ea4997e47f191d626ad2b601e3cc57a71c',
  dataAvailabilityId: '951a2a24-46fd-4306-8c31-46a8318a905e',
  type: DAActionTypes.POST_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'f7_YMkEqiALN9PCtK5LXxFDlc3EEi20-DWl57KxDMbw',
      timestamp: 1674736509185,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'Requv25_byuhK_k0JPz2tjKLhmqUv1XGt4My88utf8AHpl8awJKPMUQV3LJIQABMXf9ZsM2RZNiPhKEilkefGD-fTqkZZI5ybHooP8hc-lx2mAdM0XfCw-SC-yhdDU3OoOat7bwVy0HvOJm8xc6HpqgdbnTotX3LuPAo_xEV5GxrB5giK1IY8ZBJEsIjZw6okSzEStfmm94zAG44SmtTDXJk0IpeBpQiiZks63quZkPETGR9nfYl9-5D4UjQZHsx1eqV_9Pa4vYMOnTXD5LB8ysi2C576QjJAFICEZtRF2rXyZm1yfWBY8ODrnoZx-RBB5pqAwqrwA4DBI_UBHmbB7lL_3DK4911bZbC03T1KUw5QZn6eWjnoyxIv_UG9B3Bht0UDPIgGXA2tKeUsdrrh2JPAImZIYXEhC5ZWqn-K4TZa586sGwpQVfHFvCuCA-9X6GspXKDqlqbys6sZk70OOhM4827JIs9dw_Hw8rwsPsGIJjP99x2iOnyH8FQynbW8TCnGQcsO7Xevj-1PGnIAsXqQO6E9_NkYAf8LSfsilY63ZhVNPgLnSS2BAR-28SpHW4GjXtN_nVzE1CoLmL3nczMqHTiZ-xalo_enYg0Ydx-ZqHF7cPrB5rQmR_uB_7zPKK5WgStxwVjHRBJ8MLxmW0Sylzf9K6IwwFy50klQHY',
      deadlineHeight: 1106524,
      block: 1106524,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0xa3a969bd1ecdf7ca416340b513fd751df446b922809bd05f25509a98223b69594e4d0e5c27ce01111f80dd2df8ffd5f1af75bd6d663f55c4186ef773da2168ac1c',
      signedByDelegate: false,
      signatureDeadline: 1674736509,
      typedData: {
        types: {
          PostWithSig: [
            {
              name: 'profileId',
              type: 'uint256',
            },
            {
              name: 'contentURI',
              type: 'string',
            },
            {
              name: 'collectModule',
              type: 'address',
            },
            {
              name: 'collectModuleInitData',
              type: 'bytes',
            },
            {
              name: 'referenceModule',
              type: 'address',
            },
            {
              name: 'referenceModuleInitData',
              type: 'bytes',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'deadline',
              type: 'uint256',
            },
          ],
        },
        domain: {
          name: 'Lens Protocol Profiles',
          version: '1',
          chainId: 80001,
          verifyingContract: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
        },
        value: {
          profileId: '0x18',
          contentURI: 'ar://NKrOBI6zMU4mnptAGYvirARSvBAU-nkCITQ5-LZkEco',
          collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
          collectModuleInitData: '0x',
          referenceModule: '0x0000000000000000000000000000000000000000',
          referenceModuleInitData: '0x',
          nonce: 243,
          deadline: 1674736509,
        },
      },
      blockHash: '0x43f670549e740c8b2b7b56967b8a24a546b734c83e05ba20a515faddddc7c345',
      blockNumber: 31429670,
      blockTimestamp: 1674736509,
    },
    pointer: null,
  },
  publicationId: '0x18-0x3a-DA-951a2a24',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    contentURI: 'ar://NKrOBI6zMU4mnptAGYvirARSvBAU-nkCITQ5-LZkEco',
    collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
    collectModuleReturnData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674736509,
  }
}
```

### Comment example

```js
{
  signature:
    '0xcd9824d89bd3b237ed1230cf914630d756cae83904d835a1e85d37c11dbfab5e42c1f02042469ab29a3ccbd428c9a64576ad77f5876130b9c2bd49e0a83e9b7c1c',
  dataAvailabilityId: '9a0b1d2b-e36e-48fc-87b4-b5f3f509b494',
  type: DAActionTypes.COMMENT_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'xtVsUj5j1T4T86IQlJk2u-KubGD5oKIXOJQlU3KyGR0',
      timestamp: 1674747795383,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'TZh1F7z14pbuHq7IBlHqnhT4PXEa2dQngiL-iHEXot3-w_ScVLyN9naCeuHvAP4mialS62YPucToy4o1UQlMEtTYS2i6C0rPap32xGi2yDA6AtzURf-xELI33em-mr9QIEuOph34t0yRLn3_Bl0n-AV4jyjVSgHdYjUT0vNZx3TbRkBi_v0PgJHDYkyezP_NrZgTomEe_VZmBgozc0J9zzK6atbIdsPnHYDbY3qzTujJEwogVQa311lNZvVe2ND6MR_0EUyVVW0esin6dyYEIPPCrjlFwMMgaoW4vBbGd1d11cRGopYgNvcX_0EuwAWYGwi8XW_GNGyrk4Df14VnOXAuP4NKd5oia820Be1vqwuAs3ubWX0OQ7CttOgohO9ns7CjYg9DVIwY5-AuJd2wAK6eI09fot-lTNVwtMVBvyxQ4GWaYspMcqkpysOY-5ow0wFp7K4Ad1FI4NO71cbEZQWD8ou08_A5Gd2a6qZF2fb7IJKka0aim26N858faf1nqViZfL-aym-AW60ydNav8inrTxVTMXml61WeG4KwlQXDrdoWkEquLB-1mJ-_519ozgy0QjSbyctp4LjpDpdp-yiJvzfweMFVRIKxarVB9Vvc0NFhyllE8sZud8zLBZ7wo7GG_1wijCJaICo-iD_FK97ZegnhotGLzeDC-KqY2vQ',
      deadlineHeight: 1106619,
      block: 1106619,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x5156c7e636be61a305373df811d8444b7715448e2bde3fe69d388f301270d83d72796c5ef58283c1a9d32b37033a6b567a32addb78aedef0957fbf56956cd2351b',
      signedByDelegate: false,
      signatureDeadline: 1674747793,
      typedData: {
        types: {
          CommentWithSig: [
            {
              name: 'profileId',
              type: 'uint256',
            },
            {
              name: 'contentURI',
              type: 'string',
            },
            {
              name: 'profileIdPointed',
              type: 'uint256',
            },
            {
              name: 'pubIdPointed',
              type: 'uint256',
            },
            {
              name: 'referenceModuleData',
              type: 'bytes',
            },
            {
              name: 'collectModule',
              type: 'address',
            },
            {
              name: 'collectModuleInitData',
              type: 'bytes',
            },
            {
              name: 'referenceModule',
              type: 'address',
            },
            {
              name: 'referenceModuleInitData',
              type: 'bytes',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'deadline',
              type: 'uint256',
            },
          ],
        },
        domain: {
          name: 'Lens Protocol Profiles',
          version: '1',
          chainId: 80001,
          verifyingContract: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
        },
        value: {
          profileId: '0x18',
          profileIdPointed: '0x18',
          pubIdPointed: '0x3a',
          contentURI: 'ar://5JNO_BIyW7sD8crn1PPt3SrCZUKF9t-f8Rs13Zh1w1Q',
          referenceModule: '0x0000000000000000000000000000000000000000',
          collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
          collectModuleInitData: '0x',
          referenceModuleInitData: '0x',
          referenceModuleData: '0x',
          nonce: 243,
          deadline: 1674747793,
        },
      },
      blockHash: '0x11b2e5b1b7fa87c3a30d10d6f0416f5cb540c30ac7ae4b1be5058d9b5031e172',
      blockNumber: 31434975,
      blockTimestamp: 1674747793,
    },
    pointer: {
      location: 'ar://TEoFkgD0m-LLQkfViuCTKfCLK_xpSxzPUNoMjBLnvlI',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-9a0b1d2b',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    contentURI: 'ar://5JNO_BIyW7sD8crn1PPt3SrCZUKF9t-f8Rs13Zh1w1Q',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    collectModule: '0x5E70fFD2C6D04d65C3abeBa64E93082cfA348dF8',
    collectModuleReturnData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674747793,
  }
}
```

### Mirror example

```js
{
  signature:
    '0x1683ef107f09a291ebbe8f4bfc4f628ff9be10f661d0d18048c31a8b1ca981d948ef12c591e5d762e952bc287e57838b031a6451f2b8a58cfc5cedb565c742661b',
  dataAvailabilityId: '538ca9c4-682b-41d2-9b8a-52ede43728d7',
  type: DAActionTypes.MIRROR_CREATED,
  timestampProofs: {
    type: DAProvider.BUNDLR,
    hashPrefix: '1',
    response: {
      id: 'zdkCXuVzawg3KipWCRVK2fo-yIUoj5IMuIYyFPGA55o',
      timestamp: 1674748125246,
      version: '1.0.0',
      public:
        'sq9JbppKLlAKtQwalfX5DagnGMlTirditXk7y4jgoeA7DEM0Z6cVPE5xMQ9kz_T9VppP6BFHtHyZCZODercEVWipzkr36tfQkR5EDGUQyLivdxUzbWgVkzw7D27PJEa4cd1Uy6r18rYLqERgbRvAZph5YJZmpSJk7r3MwnQquuktjvSpfCLFwSxP1w879-ss_JalM9ICzRi38henONio8gll6GV9-omrWwRMZer_15bspCK5txCwpY137nfKwKD5YBAuzxxcj424M7zlSHlsafBwaRwFbf8gHtW03iJER4lR4GxeY0WvnYaB3KDISHQp53a9nlbmiWO5WcHHYsR83OT2eJ0Pl3RWA-_imk_SNwGQTCjmA6tf_UVwL8HzYS2iyuu85b7iYK9ZQoh8nqbNC6qibICE4h9Fe3bN7AgitIe9XzCTOXDfMr4ahjC8kkqJ1z4zNAI6-Leei_Mgd8JtZh2vqFNZhXK0lSadFl_9Oh3AET7tUds2E7s-6zpRPd9oBZu6-kNuHDRJ6TQhZSwJ9ZO5HYsccb_G_1so72aXJymR9ggJgWr4J3bawAYYnqmvmzGklYOlE_5HVnMxf-UxpT7ztdsHbc9QEH6W2bzwxbpjTczEZs3JCCB3c-NewNHsj9PYM3b5tTlTNP9kNAwPZHWpt11t79LuNkNGt9LfOek',
      signature:
        'IJjhzO0D4ioq9Gc0mghnxvOIkrZdmrqkc_UpMkL9R-qulzvkZ_LY4QRQxP-rNAm-ZIoN3Jep9zefjTaRRvU6mhc6hKZaMWC4XvWW_IXl5TZH1eOfq0JENjoRoZ75IdwicJXtc9c7obeNs84hXqlNHJXUoQfC2mEjkqiRpK_Vz43Hxn-3ZkrNvNEM1cpbl5hJU3UP0iCQnJQPiTgiojnhTBgRoIEpLQBFdoF1IRXUH4J4TBCMoX5MzG5PUj_FJkJiYX_SM0iaiDi0y-6-IsvOu1o32UWVgmDa-PbTrd6kGuDdd3Ys4HHyjGbS4NGkbu-coMW7RdkCegowgrXvzDoVxG0pVKoMK7ndOfZJJlud3jonqcDDI0vESSVdt_DDMOjkqdHiyWdVWcDlS0TnToIdwuOgaHDgpoqFjPUd5GwE40QFix6QflbxfcFqleru9eDY4_hufxMYEWK3DiSN6QIe6jQg6-9ZLFvD4Chr_bxL48UkfwDx-Y7EZo5tb6uzwzEqAfXEb5ITyzVrEgo1sXEDKKkkNQ7C5Hq2mryWKRXHUtXkKErI1P_bNRp2GXumO30uwZfpsMcAtFPCsPMnm1j4aqhFjcpVk9HpFPa6DcCuX6U8T3MODbJbNPxFc_Pdt5wcLo6EcLEnnQTIvQEIj_aQvh__rh79d6XHckI1TL-9gAM',
      deadlineHeight: 1106621,
      block: 1106621,
      validatorSignatures: [],
    },
  },
  chainProofs: {
    thisPublication: {
      signature:
        '0x59cb0d34ef20e93e4073cadec0d05eb8ef9a6af4b55d7ddea099666f83509d193e554c4149856ddb36ac3a4601c7f4e12fc413e016b6d4b314846eb3222b2e9b1b',
      signedByDelegate: false,
      signatureDeadline: 1674748123,
      typedData: {
        domain: {
          name: 'Lens Protocol Profiles',
          version: '1',
          chainId: 80001,
          verifyingContract: '0x60Ae865ee4C725cd04353b5AAb364553f56ceF82',
        },
        types: {
          MirrorWithSig: [
            {
              name: 'profileId',
              type: 'uint256',
            },
            {
              name: 'profileIdPointed',
              type: 'uint256',
            },
            {
              name: 'pubIdPointed',
              type: 'uint256',
            },
            {
              name: 'referenceModuleData',
              type: 'bytes',
            },
            {
              name: 'referenceModule',
              type: 'address',
            },
            {
              name: 'referenceModuleInitData',
              type: 'bytes',
            },
            {
              name: 'nonce',
              type: 'uint256',
            },
            {
              name: 'deadline',
              type: 'uint256',
            },
          ],
        },
        value: {
          profileId: '0x18',
          profileIdPointed: '0x18',
          pubIdPointed: '0x3a',
          referenceModuleData: '0x',
          referenceModule: '0x0000000000000000000000000000000000000000',
          referenceModuleInitData: '0x',
          deadline: 1674748123,
          nonce: 243,
        },
      },
      blockHash: '0x0fb258841acaf93b998028bfc7296b840a80cdc76ffd999d5101bc72cf2daf78',
      blockNumber: 31435129,
      blockTimestamp: 1674748123,
    },
    pointer: {
      location: 'ar://ff9CtLecXt1HBFBR-SoRz8tLjPjBo8gxbmy7kmFpJl4',
      type: DAPublicationPointerType.ON_DA,
    },
  },
  publicationId: '0x18-0x3a-DA-538ca9c4',
  event: {
    profileId: '0x18',
    pubId: '0x3a',
    profileIdPointed: '0x18',
    pubIdPointed: '0x3a',
    referenceModuleData: '0x',
    referenceModule: '0x0000000000000000000000000000000000000000',
    referenceModuleReturnData: '0x',
    timestamp: 1674748123,
  }
}
```

### Metadata breakdown

This will explain in json schema terms what a DA publication metadata holds.

#### POST_CREATED

This is a DA post.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/lens-protocol/data-availability-verifier/blob/master/src/__TESTS__/mocks/post/post-created-delegate-arweave-response.mock.ts#L10",
  "title": "The data availability layer schema",
  "description": "The data availability layer schema",
  "type": "object",
  "properties": {
    "dataAvailabilityId": {
      "description": "The id of the publication on the data availability layer; it is just a GUID",
      "type": "guid"
    },
    "signature": {
      "description": "The signature of the entire payload signed by the submitter",
      "type": "string"
    },
    "type": {
      "description": "`POST_CREATED`, `COMMENT_CREATED`, `MIRROR_CREATED` the DA action type which has been submitted",
      "type": "POST_CREATED",
    },
    "timestampProofs": {
      "description": "Details for the timestamp proofs",
      "type": "object",
      "properties": {
        "type": {
          "description": "`BUNDLR` - who has supplied us with the timestamp proofs",
          "type": "string"
        },
        "hashPrefix": {
          "description": "The timestamp proof hash prefix",
          "type": "number"
        },
        "response": {
          "description": "The response from the timestamp proof provider",
          "type": "object",
          "properties": { 
            "id": {
              "description": "The id of the timestamp proof",
              "type": "string"
            },
            "timestamp": {
              "description": "The timestamp date in milliseconds",
              "type": "number"
            },
            "version": {
              "description": "The version of the timestamp proof",
              "type": "string"
            },
            "public": {
              "description": "The public key used sign for the timestamp proofs",
              "type": "string"
            },
            "signature": {
              "description": "The signature for the timestamp proofs",
              "type": "string"
            },
            "deadlineHeight": {
              "description": "Internal deadline height for the timestamp proof",
              "type": "string"
            },
            "block": {
              "description": "Internal block for the timestamp proof (this is not an evm block)",
              "type": "number"
            },
            "validatorSignatures": {
              "description": "Internal validator signatures for the timestamp proof (this will always be an empty array for now until Bundlr is decentralised)",
              "type": "array",
               "items": {
                "type": "string"
              }
            }
           },
           "required": [ "id", "timestamp", "version", "public", "signature", "deadlineHeight", "block", "validatorSignatures" ]
        }
      },
      "required": [ "type", "hashPrefix", "response" ]
    },
    "chainProofs": {
      "description": "The proofs",
      "type": "object",
      "properties": {
        "thisPublication": {
          "description": "The publication being submitted",
          "type": "object",
          "properties": {
            "signature": {
              "description": "The transaction signature",
              "type": "string"
            },
            "signedByDelegate": {
              "description": "If the signature was signed by a delegate/dispatcher",
              "type": "boolean"
            },
            "signatureDeadline": {
              "description": "The deadline of the signature in unix form",
              "type": "number"
            },
            "typedData": {
              "description": "The typed data of the transaction; this uses the signed typed data spec",
              "type": "object",
              "properties": {
                "types": {
                  "description": "The types of the signed typed data",
                  "type": "object",
                  "properties": {
                    "PostWithSig": {
                      "description": "The properties of the typed data",
                      "type": "array",
                      "items": {
                        "description": "The name and type of the property",
                        "type": "object",
                        "properties": {
                          "name": {
                            "description": "The name of typed data",
                            "type": "string",
                          },
                          "type": {
                            "description": "The type typed data",
                            "type": "string",
                          }
                        },
                        "required": ["name", "type"]
                      }
                    },
                  },
                  "required": ["types"]
                },
                "domain": {
                  "description": "The domain of the signed typed data",
                  "type": "object",
                  "properties": {
                    "name": {
                      "description": "The name of the signed typed data",
                      "type": "string",
                    },
                    "version": {
                      "description": "The version of the signed typed data",
                      "type": "string",
                    },
                    "chainId": {
                      "description": "The chain id of the signed typed data",
                      "type": "number",
                    },
                    "verifyingContract": {
                      "description": "The verifying contract",
                      "type": "string",
                    }
                  },
                  "required": ["name", "version", "chainId", "verifyingContract"]
                },
                "value": {
                  "description": "The value of the signed typed data",
                  "type": "object",
                  "properties": {
                    "profileId": {
                      "description": "The profile id doing the publication",
                      "type": "string",
                    },
                    "contentURI": {
                      "description": "The content metadata URI",
                      "type": "string",
                    },
                    "collectModule": {
                      "description": "The collect module address - will always be a revert collect module at the moment",
                      "type": "string",
                    },
                    "collectModuleInitData": {
                      "description": "The collect module init data - will always be empty bytes for now",
                      "type": "string",
                    },
                    "referenceModule": {
                      "description": "The reference module will always be address(0) for now",
                      "type": "string",
                    },
                    "referenceModuleInitData": {
                      "description": "The reference module init data will - will always be empty bytes for now",
                      "type": "string",
                    },
                    "nonce": {
                      "description": "The signature nonce",
                      "type": "number",
                    },
                    "deadline": {
                      "description": "The signature deadline in unix form",
                      "type": "number",
                    }
                  },
                  "required": ["profileId", "contentURI", "collectModule", "collectModuleInitData", "referenceModule", "referenceModuleInitData", "nonce", "deadline"]
                }
              },
              "required": ["types", "domain", "value"]
            },
            "blockHash": {
              "description": "The block hash the submitter simulated this transaction on",
              "type": "string"
            },
            "blockNumber": {
              "description": "The block number the submitter simulated this transaction on",
              "type": "number"
            },
            "blockNumber": {
              "description": "The block unix timestamp of the simulated transaction",
              "type": "number"
            }
          },
          "required": ["signature", "signedByDelegate", "signatureDeadline", "typedData", "blockHash", "blockNumber", "blockTimestamp"]
        }
      },
       "required": [ "thisPublication" ]
    },
    "publicationId": {
      "description": "The id of the publication, which is built up of the profileId + pubId + `DA` + first eight chars of the dataAvailabilityId (so it will always be unique)",
      "type": "string"
    },
    "event": {
      "description": "This is trying to shape what you would get within an `EVM` event so you can easily parse it and understand it. This will always be identical to the EVM event data structure.",
      "type": "object",
      "properties": {
        "profileId": {
          "description": "The profileId which did the publication",
          "type": "string"
        },
        "pubId": {
          "description": "The pubId for the publication",
          "type": "string"
        },
        "contentURI": {
          "description": "The contentURI aka metadata for the publication",
          "type": "string"
        },
        "collectModule": {
          "description": "The collect module, for now it will always be revert module",
          "type": "string"
        },
        "collectModuleReturnData": {
          "description": "The collect module return data, will always for now be empty byte",
          "type": "string"
        },
        "referenceModule": {
          "description": "The reference module, will always be address(0) for now",
          "type": "string"
        },
        "referenceModuleReturnData": {
          "description": "The reference module return data, will always for now be empty byte",
          "type": "string"
        },
        "timestamp": {
          "description": "The timestamp date in milliseconds",
          "type": "number"
        }
      },
      "required": [ "profileId", "pubId", "contentURI", "collectModule", "collectModuleReturnData", "referenceModule", "referenceModuleReturnData", "timestamp" ]
    }
  },
  "required": [ "dataAvailabilityId", "type", "timestampProofs", "chainProofs", "publicationId", "event" ]
}
```

#### COMMENT_CREATED

This is a DA comment. Very similar to DA post minus the `type`, `typedData` and some `events` properties

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/lens-protocol/data-availability-verifier/blob/master/src/__TESTS__/mocks/comment/comment-created-delegate-arweave-response.mock.ts#L14",
  "title": "The data availability layer schema",
  "description": "The data availability layer schema",
  "type": "object",
  "properties": {
    "dataAvailabilityId": {
      "description": "The id of the publication on the data availability layer; it is just a GUID",
      "type": "guid"
    },
    "signature": {
      "description": "The signature of the entire payload signed by the submitter",
      "type": "string"
    },
    "type": {
      "description": "`POST_CREATED`, `COMMENT_CREATED`, `MIRROR_CREATED` the DA action type which has been submitted",
      "type": "COMMENT_CREATED",
    },
    "timestampProofs": {
      "description": "Details for the timestamp proofs",
      "type": "object",
      "properties": {
        "type": {
          "description": "`BUNDLR` - who has supplied us with the timestamp proofs",
          "type": "string"
        },
        "hashPrefix": {
          "description": "The timestamp proof hash prefix",
          "type": "number"
        },
        "response": {
          "description": "The response from the timestamp proof provider",
          "type": "object",
          "properties": { 
            "id": {
              "description": "The id of the timestamp proof",
              "type": "string"
            },
            "timestamp": {
              "description": "The timestamp date in milliseconds",
              "type": "number"
            },
            "version": {
              "description": "The version of the timestamp proof",
              "type": "string"
            },
            "public": {
              "description": "The public key used sign for the timestamp proofs",
              "type": "string"
            },
            "signature": {
              "description": "The signature for the timestamp proofs",
              "type": "string"
            },
            "deadlineHeight": {
              "description": "Internal deadline height for the timestamp proof",
              "type": "string"
            },
            "block": {
              "description": "Internal block for the timestamp proof (this is not an evm block)",
              "type": "number"
            },
            "validatorSignatures": {
              "description": "Internal validator signatures for the timestamp proof (this will always be an empty array for now until Bundlr is decentralised)",
              "type": "array",
               "items": {
                "type": "string"
              }
            }
           },
           "required": [ "id", "timestamp", "version", "public", "signature", "deadlineHeight", "block", "validatorSignatures" ]
        }
      },
      "required": [ "type", "hashPrefix", "response" ]
    },
    "chainProofs": {
      "description": "The proofs",
      "type": "object",
      "properties": {
        "thisPublication": {
          "description": "The publication being submitted",
          "type": "object",
          "properties": {
            "signature": {
              "description": "The transaction signature",
              "type": "string"
            },
            "signedByDelegate": {
              "description": "If the signature was signed by a delegate/dispatcher",
              "type": "boolean"
            },
            "signatureDeadline": {
              "description": "The deadline of the signature in unix form",
              "type": "number"
            },
            "typedData": {
              "description": "The typed data of the transaction; this uses the signed typed data spec",
              "type": "object",
              "properties": {
                "types": {
                  "description": "The types of the signed typed data",
                  "type": "object",
                  "properties": {
                    "CommentWithSig": {
                      "description": "The properties of the typed data",
                      "type": "array",
                      "items": {
                        "description": "The name and type of the property",
                        "type": "object",
                        "properties": {
                          "name": {
                            "description": "The name of typed data",
                            "type": "string",
                          },
                          "type": {
                            "description": "The type typed data",
                            "type": "string",
                          }
                        },
                        "required": ["name", "type"]
                      }
                    },
                  },
                  "required": ["types"]
                },
                "domain": {
                  "description": "The domain of the signed typed data",
                  "type": "object",
                  "properties": {
                    "name": {
                      "description": "The name of the signed typed data",
                      "type": "string",
                    },
                    "version": {
                      "description": "The version of the signed typed data",
                      "type": "string",
                    },
                    "chainId": {
                      "description": "The chain id of the signed typed data",
                      "type": "number",
                    },
                    "verifyingContract": {
                      "description": "The verifying contract",
                      "type": "string",
                    }
                  },
                  "required": ["name", "version", "chainId", "verifyingContract"]
                },
                "value": {
                  "description": "The value of the signed typed data",
                  "type": "object",
                  "properties": {
                    "profileId": {
                      "description": "The profile id doing the comment",
                      "type": "string",
                    },
                    "profileIdPointed": {
                      "description": "The profile id which the comment is being made on",
                      "type": "string",
                    },
                    "pubIdPointed": {
                      "description": "The publication id which the comment is being made on",
                      "type": "string",
                    },
                    "contentURI": {
                      "description": "The content metadata URI",
                      "type": "string",
                    },
                    "collectModule": {
                      "description": "The collect module address - will always be a revert collect module at the moment",
                      "type": "string",
                    },
                    "collectModuleInitData": {
                      "description": "The collect module init data - will always be empty bytes for now",
                      "type": "string",
                    },
                    "referenceModule": {
                      "description": "The reference module will always be address(0) for now",
                      "type": "string",
                    },
                    "referenceModuleData": {
                      "description": "The reference module data - will always be empty bytes for now",
                      "type": "string",
                    },
                    "referenceModuleInitData": {
                      "description": "The reference module init data - will always be empty bytes for now",
                      "type": "string",
                    },
                    "nonce": {
                      "description": "The signature nonce",
                      "type": "number",
                    },
                    "deadline": {
                      "description": "The signature deadline in unix form",
                      "type": "number",
                    }
                  },
                  "required": ["profileId", "profileIdPointed", "pubIdPointed", "contentURI", "collectModule", "collectModuleInitData", "referenceModule", "referenceModuleInitData", "referenceModuleData", "nonce", "deadline"]
                }
              },
              "required": ["types", "domain", "value"]
            },
            "blockHash": {
              "description": "The block hash the submitter simulated this transaction on",
              "type": "string"
            },
            "blockNumber": {
              "description": "The block number the submitter simulated this transaction on",
              "type": "number"
            },
            "blockNumber": {
              "description": "The block unix timestamp of the simulated transaction",
              "type": "number"
            }
          },
          "required": ["signature", "signedByDelegate", "signatureDeadline", "typedData", "blockHash", "blockNumber", "blockTimestamp"]
        },
        "pointer": {
          "description": "The pointer this publication is referencing",
          "type": "object",
          "properties": { 
            "location": {
              "description": "The location of the pointer publication proofs on the data availability layer",
              "type": "string"
            },
            "type": {
              "description": "the type of the publication on the data availability layer `ON_DA` or `ON_EVM_CHAIN` - for now you can not do a DA publication on a on-chain publication so will always be `ON_DA`",
              "type": "string"
            }
          },
          "required": [ "location", "type" ]
        }
      },
      "required": [ "thisPublication", "pointer" ]
    },
    "publicationId": {
      "description": "The id of the publication, which is built up of the profileId + pubId + `DA` + first eight chars of the dataAvailabilityId (so it will always be unique)",
      "type": "string"
    },
    "event": {
      "description": "This is trying to shape what you would get within an `EVM` event so you can easily parse it and understand it. This will always be identical to the EVM event data structure.",
      "type": "object",
      "properties": {
        "profileId": {
          "description": "The profileId which did the publication",
          "type": "string"
        },
        "pubId": {
          "description": "The pubId for the publication",
          "type": "string"
        },
        "contentURI": {
          "description": "The contentURI aka metadata for the publication",
          "type": "string"
        },
        "profileIdPointed": {
          "description": "The profile id of the comment is being made on",
          "type": "string"
        },
        "pubIdPointed": {
          "description": "The pub id which the comment is being made on",
          "type": "string"
        },
        "referenceModuleData": {
          "description": "The reference module data - will always be empty hex for now",
          "type": "string"
        },
        "collectModule": {
          "description": "The collect module, for now it will always be revert module",
          "type": "string"
        },
        "collectModuleReturnData": {
          "description": "The collect module return data, will always for now be empty byte",
          "type": "string"
        },
        "referenceModule": {
          "description": "The reference module, will always be address(0) for now",
          "type": "string"
        },
        "referenceModuleReturnData": {
          "description": "The reference module return data, will always for now be empty byte",
          "type": "string"
        },
        "timestamp": {
          "description": "The timestamp date in milliseconds",
          "type": "number"
        }
      },
      "required": [ "profileId", "pubId", "contentURI", "profileIdPointed", "pubIdPointed", "referenceModuleData", "collectModule", "collectModuleReturnData", "referenceModule", "referenceModuleReturnData", "timestamp" ]
    }
  },
  "required": [ "dataAvailabilityId", "type", "timestampProofs", "chainProofs", "publicationId", "event" ]
}
```

#### MIRROR_CREATED

This is a DA mirror. Very similar to DA post/comment minus the `type`, `typedData` and some `events` properties

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://github.com/lens-protocol/data-availability-verifier/blob/master/src/__TESTS__/mocks/mirror/mirror-created-without-delegate-comment-arweave-response.mock.ts#L13",
  "title": "The data availability layer schema",
  "description": "The data availability layer schema",
  "type": "object",
  "properties": {
    "dataAvailabilityId": {
      "description": "The id of the publication on the data availability layer; it is just a GUID",
      "type": "guid"
    },
    "signature": {
      "description": "The signature of the entire payload signed by the submitter",
      "type": "string"
    },
    "type": {
      "description": "`POST_CREATED`, `COMMENT_CREATED`, `MIRROR_CREATED` the DA action type which has been submitted",
      "type": "COMMENT_CREATED",
    },
    "timestampProofs": {
      "description": "Details for the timestamp proofs",
      "type": "object",
      "properties": {
        "type": {
          "description": "`BUNDLR` - who has supplied us with the timestamp proofs",
          "type": "string"
        },
        "hashPrefix": {
          "description": "The timestamp proof hash prefix",
          "type": "number"
        },
        "response": {
          "description": "The response from the timestamp proof provider",
          "type": "object",
          "properties": { 
            "id": {
              "description": "The id of the timestamp proof",
              "type": "string"
            },
            "timestamp": {
              "description": "The timestamp date in milliseconds",
              "type": "number"
            },
            "version": {
              "description": "The version of the timestamp proof",
              "type": "string"
            },
            "public": {
              "description": "The public key used sign for the timestamp proofs",
              "type": "string"
            },
            "signature": {
              "description": "The signature for the timestamp proofs",
              "type": "string"
            },
            "deadlineHeight": {
              "description": "Internal deadline height for the timestamp proof",
              "type": "string"
            },
            "block": {
              "description": "Internal block for the timestamp proof (this is not an evm block)",
              "type": "number"
            },
            "validatorSignatures": {
              "description": "Internal validator signatures for the timestamp proof (this will always be an empty array for now until Bundlr is decentralised)",
              "type": "array",
               "items": {
                "type": "string"
              }
            }
           },
           "required": [ "id", "timestamp", "version", "public", "signature", "deadlineHeight", "block", "validatorSignatures" ]
        }
      },
      "required": [ "type", "hashPrefix", "response" ]
    },
    "chainProofs": {
      "description": "The proofs",
      "type": "object",
      "properties": {
        "thisPublication": {
          "description": "The publication being submitted",
          "type": "object",
          "properties": {
            "signature": {
              "description": "The transaction signature",
              "type": "string"
            },
            "signedByDelegate": {
              "description": "If the signature was signed by a delegate/dispatcher",
              "type": "boolean"
            },
            "signatureDeadline": {
              "description": "The deadline of the signature in unix form",
              "type": "number"
            },
            "typedData": {
              "description": "The typed data of the transaction; this uses the signed typed data spec",
              "type": "object",
              "properties": {
                "types": {
                  "description": "The types of the signed typed data",
                  "type": "object",
                  "properties": {
                    "MirrorWithSig": {
                      "description": "The properties of the typed data",
                      "type": "array",
                      "items": {
                        "description": "The name and type of the property",
                        "type": "object",
                        "properties": {
                          "name": {
                            "description": "The name of typed data",
                            "type": "string",
                          },
                          "type": {
                            "description": "The type typed data",
                            "type": "string",
                          }
                        },
                        "required": ["name", "type"]
                      }
                    },
                  },
                  "required": ["types"]
                },
                "domain": {
                  "description": "The domain of the signed typed data",
                  "type": "object",
                  "properties": {
                    "name": {
                      "description": "The name of the signed typed data",
                      "type": "string",
                    },
                    "version": {
                      "description": "The version of the signed typed data",
                      "type": "string",
                    },
                    "chainId": {
                      "description": "The chain id of the signed typed data",
                      "type": "number",
                    },
                    "verifyingContract": {
                      "description": "The verifying contract",
                      "type": "string",
                    }
                  },
                  "required": ["name", "version", "chainId", "verifyingContract"]
                },
                "value": {
                  "description": "The value of the signed typed data",
                  "type": "object",
                  "properties": {
                    "profileId": {
                      "description": "The profile id doing the comment",
                      "type": "string",
                    },
                    "profileIdPointed": {
                      "description": "The profile id which the comment is being made on",
                      "type": "string",
                    },
                    "pubIdPointed": {
                      "description": "The publication id which the comment is being made on",
                      "type": "string",
                    },
                    "referenceModule": {
                      "description": "The reference module will always be address(0) for now",
                      "type": "string",
                    },
                    "referenceModuleData": {
                      "description": "The reference module data - will always be empty bytes for now",
                      "type": "string",
                    },
                    "referenceModuleInitData": {
                      "description": "The reference module init data - will always be empty bytes for now",
                      "type": "string",
                    },
                    "nonce": {
                      "description": "The signature nonce",
                      "type": "number",
                    },
                    "deadline": {
                      "description": "The signature deadline in unix form",
                      "type": "number",
                    }
                  },
                  "required": ["profileId", "profileIdPointed", "pubIdPointed", "referenceModule", "referenceModuleInitData", "referenceModuleData", "nonce", "deadline"]
                }
              },
              "required": ["types", "domain", "value"]
            },
            "blockHash": {
              "description": "The block hash the submitter simulated this transaction on",
              "type": "string"
            },
            "blockNumber": {
              "description": "The block number the submitter simulated this transaction on",
              "type": "number"
            },
            "blockNumber": {
              "description": "The block unix timestamp of the simulated transaction",
              "type": "number"
            }
          },
          "required": ["signature", "signedByDelegate", "signatureDeadline", "typedData", "blockHash", "blockNumber", "blockTimestamp"]
        },
        "pointer": {
          "description": "The pointer this publication is referencing",
          "type": "object",
          "properties": { 
            "location": {
              "description": "The location of the pointer publication proofs on the data availability layer",
              "type": "string"
            },
            "type": {
              "description": "the type of the publication on the data availability layer `ON_DA` or `ON_EVM_CHAIN` - for now you can not do a DA publication on a on-chain publication so will always be `ON_DA`",
              "type": "string"
            }
          },
          "required": [ "location", "type" ]
        }
      },
      "required": [ "thisPublication", "pointer" ]
    },
    "publicationId": {
      "description": "The id of the publication, which is built up of the profileId + pubId + `DA` + first eight chars of the dataAvailabilityId (so it will always be unique)",
      "type": "string"
    },
    "event": {
      "description": "This is trying to shape what you would get within an `EVM` event so you can easily parse it and understand it. This will always be identical to the EVM event data structure.",
      "type": "object",
      "properties": {
        "profileId": {
          "description": "The profileId which did the mirror",
          "type": "string"
        },
        "pubId": {
          "description": "The pubId for the mirror",
          "type": "string"
        },
        "profileIdPointed": {
          "description": "The profile id of the mirror is being made on",
          "type": "string"
        },
        "pubIdPointed": {
          "description": "The pub id which the mirror is being made on",
          "type": "string"
        },
        "referenceModuleData": {
          "description": "The reference module data - will always be empty hex for now",
          "type": "string"
        },
        "referenceModule": {
          "description": "The reference module, will always be address(0) for now",
          "type": "string"
        },
        "referenceModuleReturnData": {
          "description": "The reference module return data, will always for now be empty byte",
          "type": "string"
        },
        "timestamp": {
          "description": "The timestamp date in milliseconds",
          "type": "number"
        }
      },
      "required": [ "profileId", "pubId", "profileIdPointed", "pubIdPointed", "referenceModuleData", "referenceModule", "referenceModuleReturnData", "timestamp" ]
    }
  },
  "required": [ "dataAvailabilityId", "type", "timestampProofs", "chainProofs", "publicationId", "event" ]
}
```

## Validation checks flows

This is written in sudo `node` code to understand the current flow of the validation checks. 

```ts
async function validateClaim() {
  // 1. Fetch DA metadata from Bundlr
  const metadata = await fetchMetadataFromBundlr();

  // 2. Check if `signature` is defined
  if (!signature) {
    return BonsaiValidatorError.NO_SIGNATURE_SUBMITTER;
  }

  // 3. Verify `signature` with `metadata`
  if (!verifySignature(signature, metadata)) {
    return BonsaiValidatorError.INVALID_SIGNATURE_SUBMITTER;
  }

  // 4. Check timestamp proofs with Bundlr
  if (!await checkTimestampProofs()) {
    return BonsaiValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE;
  }

  // 5. Check if timestamp proofs submitter is valid
  if (!isValidTimestampProofsSubmitter()) {
    return BonsaiValidatorError.TIMESTAMP_PROOF_INVALID_SUBMITTER;
  }

  // 6. Check if event `timestamp` equals `blockTimestamp`
  if (eventTimestamp !== blockTimestamp) {
    return BonsaiValidatorError.INVALID_EVENT_TIMESTAMP;
  }

  // 7. Check if block number is closest to timestamp proofs
  if (!isClosestBlock()) {
    return BonsaiValidatorError.NOT_CLOSEST_BLOCK;
  }

  // 8. Check if pointer is defined
  if (isPost() && pointer) {
    return BonsaiValidatorError.INVALID_POINTER_SET_NOT_NEEDED;
  } else if (!pointer && (isMirror() || isComment())) {
    return BonsaiValidatorError.INVALID_POINTER_NOT_SET;
  }

  // 8.1. Check pointer type (if defined)
  if (pointer && !isPointerTypeOnDA()) {
    return PUBLICATION_NONE_DA;
  }

  // 9. Verify pointer (if defined) - follow steps from 1
  const pointerStepError = await verifyPointer();
  if (pointerStepError) {
    return pointerStepError;
  }

  // 10. Check if formatted typed data is valid
  if (!isValidFormattedTypedData()) {
    return BonsaiValidatorError.INVALID_FORMATTED_TYPED_DATA;
  }

  // 11a. If `POST`, simulate transaction using eth_call
  if (isPost()) {
    const simulationResult = await simulateTransaction();
    if (simulationResult === 'nodeError') {
      return BonsaiValidatorError.SIMULATION_NODE_COULD_NOT_RUN;
    } else if (simulationResult === 'failed') {
      return BonsaiValidatorError.SIMULATION_FAILED;
    }
  }
  // 11b. If `COMMENT` or `MIRROR`, perform additional checks
  else {
    if (!isValidPublicationNonce()) {
      return BonsaiValidatorError.PUBLICATION_NONCE_INVALID;
    }
    if (!isPublicationSignerAllowed()) {
      return BonsaiValidatorError.PUBLICATION_SIGNER_NOT_ALLOWED;
    }
  }

  // 12. Cross-check typed data values with `event`
  if (!isEventMatchingTypedData()) {
    return BonsaiValidatorError.EVENT_MISMATCH;
  }

  // 13. Check if `publicationId` matches expected ID
  if (!isPublicationIdMatch()) {
    // 14. Check if it could of been a potential reorg 
    
    // if so:
    return BonsaiValidatorError.POTENTIAL_REORG;

    // if not 
    return BonsaiValidatorError.GENERATED_PUBLICATION_ID_MISMATCH;
  }

  // all validated!
}
```

At this point, you have done all the checks needed, and this is a valid submission! As you see, using signatures and EVM calls, we can verify the data is correct and the submitter is correct without any other third party.

### Validation error checks types and messages

The summary in the code should explain what is being checked for and what it would fail out if it doesn't match. Below is the full list of error cases

```ts
export enum BonsaiValidatorError {
  /**
   * This means the main signature has not been attached to the payload
   */
  NO_SIGNATURE_SUBMITTER = 'NO_SIGNATURE_SUBMITTER',

  /**
   * This means the main signature has not been signed by the same payload as the data itself
   */
  INVALID_SIGNATURE_SUBMITTER = 'INVALID_SIGNATURE_SUBMITTER',

  /**
   * This means the submitted timestamp proof does not have a valid timestamp proof signature
   */
  TIMESTAMP_PROOF_INVALID_SIGNATURE = 'TIMESTAMP_PROOF_INVALID_SIGNATURE',

  /**
   * This means the type in the timestamp proofs do not match
   * timestamp proofs are not portable
   */
  TIMESTAMP_PROOF_INVALID_TYPE = 'TIMESTAMP_PROOF_INVALID_TYPE',

  /**
   * This means the da id in the timestamp proofs do not match up
   * timestamp proofs are not portable
   */
  TIMESTAMP_PROOF_INVALID_DA_ID = 'TIMESTAMP_PROOF_INVALID_DA_ID',

  /**
   * This means the timestamp proof uploaded was not done by a valid submitter
   */
  TIMESTAMP_PROOF_NOT_SUBMITTER = 'TIMESTAMP_PROOF_NOT_SUBMITTER',

  /**
   * We tried to call them 5 times and its errored out - this is not a bad proof but bundlr/arweave are having issues
   */
  CAN_NOT_CONNECT_TO_BUNDLR = 'CAN_NOT_CONNECT_TO_BUNDLR',

  /**
   * The DA tx could not be found or invalid on the bundlr/arweave nodes
   * can happened if pasted it in wrong
   */
  INVALID_TX_ID = 'INVALID_TX_ID',

  /**
   * This the typed data format is invalid (aka a invalid address type etc)
   */
  INVALID_FORMATTED_TYPED_DATA = 'INVALID_FORMATTED_TYPED_DATA',

  /**
   * This means it can not read the block from the node
   */
  BLOCK_CANT_BE_READ_FROM_NODE = 'BLOCK_CANT_BE_READ_FROM_NODE',

  /**
   * This means it can not read the data from the node
   */
  DATA_CANT_BE_READ_FROM_NODE = 'DATA_CANT_BE_READ_FROM_NODE',

  /**
   * This means the simulation was not able to be ran on the node, this does not mean
   * that it would fail on chain, it means the nodes may of been down and needs rechecking
   */
  SIMULATION_NODE_COULD_NOT_RUN = 'SIMULATION_NODE_COULD_NOT_RUN',

  /**
   * This means the simulation was not successful and got rejected on-chain
   * or the result from the simulation did not match the expected result
   */
  SIMULATION_FAILED = 'SIMULATION_FAILED',

  /**
   * This means the event emitted from the simulation does not match the expected event
   */
  EVENT_MISMATCH = 'EVENT_MISMATCH',

  /**
   * This means the event timestamp passed into the emitted event does not match the signature timestamp
   */
  INVALID_EVENT_TIMESTAMP = 'INVALID_EVENT_TIMESTAMP',

  /**
   * This means the deadline set in the typed data is not correct
   */
  INVALID_TYPED_DATA_DEADLINE_TIMESTAMP = 'INVALID_TYPED_DATA_DEADLINE_TIMESTAMP',

  /**
   * This means the generated publication id for the generic id does not match
   * what it should be
   */
  GENERATED_PUBLICATION_ID_MISMATCH = 'GENERATED_PUBLICATION_ID_MISMATCH',

  /**
   * This means the pointer set in the chain proofs is not required but set anyway
   */
  INVALID_POINTER_SET_NOT_NEEDED = 'INVALID_POINTER_SET_NOT_NEEDED',

  /**
   * This means the pointer has failed verification
   */
  POINTER_FAILED_VERIFICATION = 'POINTER_FAILED_VERIFICATION',

  /**
   * This means the block processed against is not the closest block to the timestamp proofs
   */
  NOT_CLOSEST_BLOCK = 'NOT_CLOSEST_BLOCK',

  /**
   * This means the timestamp proofs are not close enough to the block
   */
  BLOCK_TOO_FAR = 'NOT_CLOSEST_BLOCK',

  /**
   * This means the publication submitted does not have a valid pointer
   * and a pointer is required
   */
  PUBLICATION_NO_POINTER = 'PUBLICATION_NO_POINTER',

  /**
   * Some publications (comment and mirror) for now can only be on another
   * DA publication not on evm chain publications
   */
  PUBLICATION_NONE_DA = 'PUBLICATION_NONE_DA',

  /**
   * This means the publication nonce is invalid at the time of submission
   */
  PUBLICATION_NONCE_INVALID = 'PUBLICATION_NONCE_INVALID',

  /**
   * This means the publication submisson was signed by a wallet that is not allowed
   */
  PUBLICATION_SIGNER_NOT_ALLOWED = 'PUBLICATION_SIGNER_NOT_ALLOWED',

  /**
   * This means the publication submisson could not pass potentional due to a reorg
   */
  POTENTIAL_REORG = 'POTENTIAL_REORG',

  /**
   * unknown error should not happen but catch all
   */
  UNKNOWN = 'UNKNOWN',
}
```

## Submitter flow

The flow diagram shows the submitter flows in detail; the first submitter will be within the LENS API to allow for easy integration for all. 

<img src="https://statics-polygon-lens.s3.eu-west-1.amazonaws.com/submitter-flows.png">

## Future of decentralised submitters

This is a rough look at how this could work in the future in a trustless manner. This is not the final solution but a rough idea of how it could work on a very high-level vision.

<img src="https://statics-polygon-lens.s3.eu-west-1.amazonaws.com/submitters-later-vision.png">

## Running

### Key information

To run the verifier, you MUST use an archive node. You can sign up with Alchemy and use one of their free nodes. Non-archive nodes do not retain state information beyond the previous 16-128 blocks. While this may be sufficient for immediate runtime calls after the DA publication is created, it will not work for past transactions beyond the 16-128 block range.

### Being as fast as possible - Concurrency

The verifier is designed for optimal speed, with performance determined by its configuration parameters. Achieving 10,000 TPS is not a problem, provided that the hardware and nodes can support these limits. When running the verifier, you have the option to set the CONCURRENCY, which divides the number of requests sent to the NODE_URL simultaneously. Higher concurrency values result in faster performance during resynchronization or when handling a large volume of transactions at once.

The default concurrency is 100, which typically requires a paid archive node. If you prefer using a free node, the verifier will be slower, but it will still work effectively. For a free node, you can set the concurrency between 1 and 3. For example, at LENS, we have set the concurrency at 120, which enables our verifier to run very quickly.

## Running straight out the box

You can install it globally: 

```bash
$ npm i @lens-protocol/bonsai -g
```

then you can just run:

```bash
$ bonsai --node 'YOUR_NODE' --environment='MUMBAI|POLYGON' --concurrency=100 --fromHead=false
```

you can also just run with npx:

```bash
$ npx bonsai --node 'YOUR_NODE' --environment='MUMBAI|POLYGON' --concurrency=100 --fromHead=false
```

### Parameter meanings

- `--node` - this is the node you wish to connect to, this can be a free node or a paid node, it is recommended to use a paid node for the best performance
- `--environment` - this is the environment you wish to run the verifier on, this can be `MUMBAI` or `POLYGON`
- `--concurrency` - this is the concurrency you wish to run the verifier on, which was talked in depth above
- `--fromHead` - this is a boolean value, which if set to true will start the verifier from the head of the chain aka the most recent transaction, if set to false it will start from the last block and resync from zero.

## Installing package

This is a written in node, and this means it can be run on the client as well as a server; it won't use the DB on the client but can mean you can run proof checks in runtime, which is super powerful. Also, you may which to monitor this on your server to index stuff as it comes in.

```bash
$ npm i @lens-protocol/bonsai
```

<b>Do not use if you do not know what you are doing the basic config works for all production apps</b>

Please note if you wish to use a different deployment then `PRODUCTION` you will need to make sure you put `deployment: STAGING` or `deployment: LOCAL` in the `EthereumNode` object. This for most will not be the case.

### Client usage

The package exposes a separate entry point for the client usage (`'@lens-protocol/bonsai/client'`) to make sure the bundle size is not affected by any polyfills or other node specific code.

Check the `playground-browser` folder for a working example of the client usage.

#### checkDAProof

The `checkDAProof` will return you a failure reason of the enum `BonsaiValidatorError`, and if successful, you be returned the entire `DAStructurePublication`. This is a client specific version of the `checkDAProof` function that doesn't have any caching in place. For the server version, please see the server usage section.

```ts
import { checkDAProof, EthereumNode, Environment } from '@lens-protocol/bonsai/client';

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

const result = await checkDAProof(PROOF_ID, ethereumNode);
if (result.isSuccess()) {
    console.log('proof valid', result.successResult)
    return; // all is well!
}

// it failed!
console.error('proof invalid do something', result.failure)
```

### Server usage

#### checkDAProof

The `checkDAProof` will return you a failure reason of the enum `BonsaiValidatorError`, and if successful, you be returned the entire `DAStructurePublication`. This is a server specific version of the `checkDAProof` function that has caching in place. For the client version, please see the client usage section.

```ts
import { checkDAProof, EthereumNode, Environment } from '@lens-protocol/bonsai';

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

const result = await checkDAProof(PROOF_ID, ethereumNode);
if (result.isSuccess()) {
    console.log('proof valid', result.successResult)
    return; // all is well!
}

// it failed!
console.error('proof invalid do something', result.failure)
```

#### startDAVerifierNode

This will start watching all the DA items coming in and logging it all out in your terminal. you can install the package and run it on your own server.

```ts
import { startDAVerifierNode, EthereumNode } from '@lens-protocol/bonsai';

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

// you should read up on section "Being as fast as possible - Concurrency"
const concurrency = 100;

// it run forever and log out to the terminal
startDAVerifierNode(ethereumNode, concurrency);
```

#### startDAVerifierNode - Stream with proofs verified

If you wish to index the data yourself, you can use the `startDAVerifierNode` and stream the data out to your own DB using the `StreamCallback`. This will run the verifier node and check the proofs as every new one comes in.

```ts
import { startDAVerifierNode, StreamResult, EthereumNode } from '@lens-protocol/bonsai';

const stream = (result: StreamResult) => {
  console.log('streamed publication', result);

  if(result.success) {
    // success - insert into your db here if you wish
    console.log('success', result.dataAvailabilityResult)
  } else {
    // failure reason
    console.log('reason', result.failureReason);
    // this will expose the submisson if it could be read
    console.log('submisson', result.dataAvailabilityResult)
  }
};

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

// you should read up on section "Being as fast as possible - Concurrency"
const concurrency = 100;

// it run forever and log out to the terminal
startDAVerifierNode(ethereumNode, concurrency, { stream });
```

#### Start verifier from head

You may wish to start the verifier from the head of the chain and not resync all the passed, this is useful to just start checking new proofs. You can do this by passing in the `syncFromHeadOnly` option.

```ts
import { startDAVerifierNode, StreamResult, EthereumNode } from '@lens-protocol/bonsai';

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

// you should read up on section "Being as fast as possible - Concurrency"
const concurrency = 100;

// it run forever and log out to the terminal
startDAVerifierNode(ethereumNode, concurrency, { syncFromHeadOnly: true });
```

#### startDATrustingIndexing

If you just want to get the data as fast as possible and do not wish to verify the proofs, you can use the `startDATrustingIndexing` function. This will stream out the data as fast as possible and will not check the proofs, so does not require an archive node.

```ts
import { startDATrustingIndexing, StreamResult, StartDATrustingIndexingRequest } from '@lens-protocol/bonsai';

const stream = (result: StreamResult) => {
  console.log('streamed publication', result);

  if(result.success) {
    // success - insert into your db here if you wish
    console.log('success', result.dataAvailabilityResult)
  } else {
    // failure reason
    console.log('reason', result.failureReason);
    // this will expose the submisson if it could be read
    console.log('submisson', result.dataAvailabilityResult)
  }
};

const request: StartDATrustingIndexingRequest = {
  environment: Environment.POLYGON,
  stream,
};

// it run forever and stream data as it comes in
startDATrustingIndexing(request);
```

### Running from this repo

#### Dependencies

This package has a few dependencies that need to be installed, these are:

- we use `pnpm` for this repo so please have it installed: https://pnpm.io/installation
- nvm is also used for node versioning:

If you wish to just run it on its own, you can just run:

```bash
$ nvm use
$ pnpm i
$ pnpm run start
```

To build its just:

```bash
$ pnpm build
```

### Docker

Please note you need a `.env` setup for this to work.

To run the docker first build it:

```bash
$ docker build -t da-service .
```

Then run it:

```bash
$ docker run -d -p 3008:3008 da-service
```

This will return an docker id.

Then to listen to the logs you can:

```bash
docker logs <id>
```

## Contributing

Any PRs are welcome and we will review them as soon as possible. Please make sure you have tests and they pass.

## Acknowledgements

### Bundlr

A special thank you to [Bundlr](https://bundlr.network/) for making this project possible with their cutting-edge technology. We are grateful to their exceptional team for their collaboration and support.

### Arweave

We also extend our gratitude to [Arweave](https://www.arweave.org/) for providing decentralized storage solutions for our data, contributing to the overall success of the DA project.

