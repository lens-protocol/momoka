# Data availability verifier

Data availability verifier allows you to run a trustless verifier node that checks in real-time the submitted LENS DA publications. On top of this, you can use this as an indexer and stream the data if you wish to index it yourself. The code is all open and only uses software you can run yourself without a dependency on LENS. It means if LENS ever went away, you would still have all your content; you would still have the ability to prove that you own it. You would still be able to use it, all stored in a decentralised data availability storage layer.

Please see the [How to run](#running) section if you wish to know how to run this software.

## What is DA

DA stands for Data Availability. It is a concept of storing the data in a decentralised availability layer, which is much cheaper than keeping it on an EVM chain. It has no latency meaning the data is produced straight away and querable unlike IPFS and EVM chain which always have latency until they are seen as complete. We use Arweave and Bundlr to do this. Arweave is a decentralised permanent storage network with over 300 nodes running on it; Instagram and many NFT projects are starting to use them. Bundlr scales Arweave while providing DA guarantees, allowing you to use EVM wallets to save DA logic and is a tool to push data to arweave quickly. DA could be used to store actions like posts, comments, mirrors and others; for now, we are starting with publications. The idea is that you can keep the DA layer cheaper and scalable and still verify the transactions on polygon using EVM simulations. DA is a one time payment to store the data and is backed by math and hardware history in how it can offer it.

If you want to verify that a particular action would have been executed on-chain, you can use this software to prove it. The idea is that you do the same signing actions as you would on an EVM chain, but you never actually send the transaction (the part which costs gas to store in the EVM state). Instead, you build up a DA standard and save it on a DA layer with proofs and all the information you need. You can then allow ANYONE to cross-check the data; doing so will enable you to 100% prove that this action must have been actioned by someone who could create the transaction signature and submit it as you can prove it by simulating the transaction. All of the above allows LENS to scale but still have the core message of "ownership" and "trust", which the blockchain provides.

## Why do we need to use DA

EVM can store state forever, but it comes at a price; blockchains were built for transactional trustless systems. EVM is secured by the network and mined into the chain; the idea is that you can trust the data on-chain as it is immutable, and you can verify this anytime. The problem is that the data is expensive to store on-chain, and also, the EVM machines can only accept a certain amount of transactions per block based on the maximum gas limits. Polygon is a shared block space; if you wanted to scale more than 50-100tps, it wouldn't be possible. With block times being 2 seconds, you always have some form of latency, and with the max gas limits per block, scaling is hard/impossible. For context, Twitter does 25,000TPS in peak; not saying LENS needs this now, but it needs to think about how it could work. This is why we have DA layers; they are cheaper and allow you to store the data with a one-off payment; this is backed up by math and a history of hardware price decreases over the years. Even more so, these DA layers are decentralised, meaning you do not lose that part when using them. DA allows you to scale passed 25,000TPS and even more; if we are going to change the world of core social ownership, we need to scale.

## What are transaction on EVM machines

A transaction changes some form of state; the wallet's private key signs it and then sends it to the network. The network then verifies the signature and executes the transaction; the transaction contains logic to run which can revert or succeed; if it reverts, then it is not included in the new block, but if it passes, it is included in the new block and then confirmed by other miners; The miners that do this are incentivised to do so. Now it makes you think that here you can not "fake" transactions because they require being signed by something which would pass on-chain, with this also a key you should only own or trust (the whole ethos of blockchain). On top of this, a transaction can either succeed or revert, nothing more, nothing less, as EVM moves block by block, which updates the state each time it makes you think that on stuff which does not need to have a form of funds changing hands or trustless executions by others what happens if you did not send the transaction but did everything else?

## How could DA and EVM work together

Well, LENS is deployed on Polygon, and that is an EVM machine; with that, every post, comment, mirror, follow, collect etc., is a transaction which is sent and stored on the EVM machine; the transactions are built up, signed and sent. Here we still build up the transactions and still require a signature from a wallet which would pass the state on-chain, but it does not actually send it; it passes the signature of the transaction and typed data and then builds up the DA metadata. This metadata is then sent to a DA layer which contains stuff like block number, signed typed data, transaction signature and other important things. This data is built up in a way which is fully verifiable on-chain by the EVM machine; let me explain that part.

EVM machines are just big state machines; in the EVM JSON-RPC methods, you have the ability to simulate transactions using `eth_call`. This actually allows you to know the outcome of a transaction WITHOUT sending it. You can define a block number for it to run on and the signed typed data transaction using the typed data; we can do this with every `withSig` method on the LENS contracts. With just a polygon node, anyone can prove that what is on the DA layer is true and would have passed at that point in time. As the typed data has expiry times and nonces etc., it is all provable in a safe manner and can not be submitted by anyone else. 

The beauty of this is it's saved on a decentralised layer. No centralised entity is storing the content; this means the user still owns all their publications; if any part of LENS went away tomorrow, all that data would be verifiable, fetchable, and can be used by anyone. This is the power of decentralisation; you can not take away the data from the user.

## What does this mean

It means LENS could scale to 25,000TPS+, which would not be possible at the current time with an EVM chain, and it is a much cheaper approach. This can be done without hurting the core ownership of the social graph. This can be indexed just as if you were watching out for blockchain events, so the learning curve is nothing new. This is an app developer and person's choice to use it; if you do not want to use it, then you do not have to; they can have everything stored on polygon if they wish, but if the publication does not need the power of trustless execution layer then why does it need to use the EVM state? It does not.

## Submitters

Anything which has some form of "trust" needs some form of "slashing" if they act badly. Our submitters will start as a whitelisted array of addresses; for now, this will just be one address LENS owns. Once this approach is proven and later down the line, this can be opened up to anyone to be a submitter with incentives but also the ability to lose something if they are a bad actor. If the submitters have nothing to lose, then they can flood the system with invalid submissions; this also means the verifier has no incentives to prove the submitters wrong. Of course, they can't make up signatures, but they could DDOS the entire system by submitting a lot of invalid data making it hard to catch up and lagging the system. Our submitter will be accountable for any mistakes, and a bug bounty will be paid out if someone finds a bad submission. This whole system could be decentralised over time. For now, we see this as a beta approach to scaling; when I say beta, it doesn't mean it will ever go away. It's just our first stab at how we can scale using a hybrid module model.

It's the submitter's job to validate, build up the DA metadata and submit this to Arweave/Bundlr. Once the proofs have been generated with the DA submission, it is uploaded to Aarweave via Bundlr, which response is instant; we will run through the entire flow shortly. It is the submitter's job to give back proofs that anyone can contest. The submitters are whitelisted, so the verifier software listens out for all DA publications sent from those addresses and verifies it is a valid submissions.

## Verifiers

The verifier's job is to listen out for all DA publications sent from the submitters and verify it is a valid submissions. It has a certain amount of criteria it must check when the publications come in; its sole purpose is to just prove the submitter is telling the truth. Anyone can run a verifier; it's just open-source software which can be run with a few commands. The verifier uses leveldb to store passed results allowing it to be very fast.

## Current restrictions with DA publications

- DA publications must have `RevertCollectModule` and no `ReferenceModule` set. We will look at handling that in a later release.
- DA comments only work on other DA publications and can not mix for now. This is, again, something we look at after the v1 launch.
- DA mirrors can only mirror DA publications and can not mirror Polygon publications. This is, again, something we will look at solving after the v1 launch.
- When you do a DA publication on another DA publication that is not provable on Polygon so you can not run a simulation on it, but you can still prove the signatures and transaction are valid.
- When you verify a submission, it always checks the pointer as well; it only checks the first pointer and not unlimited pointers, as the other checks would have been done by the verifier. 

## Does it work with signature free

Throughout building LENS, we know how important a top-class UX is for users. Image when you used Twitter, and you had to confirm everything all the time, on every action, it would be painful. DA publications work with the dispatcher, as the dispatcher can post/mirror/comment on your behalf anyway. If enabled, it would pass the state checks. The logic on the LENS contract states that if the dispatcher signs on your behalf, it would be a valid transaction and pass. If the user does not want to trust the dispatcher, they can still just sign the typed data with their wallet and send it through the submitter. This is the same flow as you do now, but instead of sending it to the submitter, you would send it to a Polygon node.

## Gasless

As no gas is involved in this DA operation, it is free for anyone to use. The metadata will be pinned and storage paid for by the submitter, but as the storage is on Arweave/Bundlr, it is very, very cheap (1000x cheaper than EVM gas prices).

## Timestamp proofs for picking the block number

You may be thinking, well, a submitter could lie about which block to submit on, but that's where bundlr timestamp proofs come in; on top of this, each signature has a deadline which would be a timestamp of a block which has already been mined meaning the signature would not be valid if sent. Bundlr allows you to request timestamp proof where they just return the current timestamp but store it so anyone can verify the time was generated by them. This is now our source of truth for which block number we should use; we should use the closest block number to the timestamp generated by bundlr. Bear in mind latency will always happen down to node software, so if it picks a block number and, on verification, it is one behind, then we see this as a threshold we are ok to accept. As it's even more in the past, the main thing is it will never accept a block in the future.

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

### Metadata breakdown:

- `dataAvailabilityId` - the id of the publication on the data availability layer; it is just a GUID
- `signature` - the signature of the entire payload signed by the submitter
- `type` - `POST_CREATED`, `COMMENT_CREATED`, `MIRROR_CREATED` the DA action type which has been submitted
- `timestampProofs` - bundlr gives us a timestamp proof
    - `type` - who has supplied us with the timestamp proofs
    - `timestamp` - the timestamp
    - `version`, `public`, `signature`, `deadlineHeight`, `block`, `validatorSignatures` - the metadata to allow you to prove the `type` did it when you recheck on the verifier
- `chainProofs` - the proofs for the publication
    - `thisPublication` - the publication being submitted
        - `signature` - the transaction signature
        - `signedByDelegate` - if the signature was signed by a delegate/dispatcher
        - `signatureDeadline` - the deadline of the signature in unix form
        - `typedData` - the typed data of the transaction; this uses the signed typed data spec
            - `domain` - the domain of the transaction
            - `types` - the types of the transaction
            - `value` - the value of the transaction
        - `blockHash` - the block hash the submitter simulated this transaction on
        - `blockNumber` - the block number the submitter simulated this transaction on
        - `blockTimestamp` - the block timestamp of the simulated transaction
- `pointer` - the pointer this publication is referencing, saying it's a comment or a mirror. Post will never have a pointer
    - `location` - the location of the publication on the data availability layer
    - `type` - the type of the publication on the data availability layer `ON_DA` or `ON_EVM_CHAIN`
        - for now, it will always be `ON-DA` as it can not be mixed and matched
- `publicationId` - the id of the publication, which is built up of the profileId + pubId + `DA` + first eight chars of the dataAvailabilityId (so it will always be unique)
- `event` - this is trying to shape what you would get within an `EVM` event so you can easily parse it and understand it. This will always be identical to the EVM event data structure.

## Validation checks flows

Here are the steps to make it easier to understand how the verifier works; of course, the code is all open source, so you can check. We have full coverage as well.

1) Fetches the DA metadata from Bundlr
2) Checks the `signature` is defined - if not, returns `ClaimableValidatorError.NO_SIGNATURE_SUBMITTER`
3) Verifies the `signature` with the `metadata` has been signed by the submitter - if not, return `ClaimableValidatorError.INVALID_SIGNATURE_SUBMITTER`
4) Check the timestamp proofs with `bundlr` - if not, return `ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SIGNATURE`
5) Check if the timestamp proofs submitter is a valid submitter - if not, return `ClaimableValidatorError.TIMESTAMP_PROOF_INVALID_SUBMITTER`
6) Check if the event `timestamp` is equal to the publication submitted `blockTimestamp` - if not, return `ClaimableValidatorError.INVALID_EVENT_TIMESTAMP`
7) Check that the block number in the publication submission is closest to the timestamp proofs - if not, return `ClaimableValidatorError.NOT_CLOSEST_BLOCK`
8) Check that the pointer is defined or not 
    - if it is set and a `POST` return `ClaimableValidatorError.INVALID_POINTER_SET_NOT_NEEDED`
    - if it is not set and is a `MIRROR` or `COMMENT` return `ClaimableValidatorError.INVALID_POINTER_NOT_SET`
        8.1) Check the pointer type is `ON_DA` - if not, return `PUBLICATION_NONE_DA`
9) If the pointer is defined, then do verification on the pointer, which follows these flows from step 1 again - if it fails, return the step error 
10) Check that the formatted typed data is valid - if not, return `ClaimableValidatorError.INVALID_FORMATTED_TYPED_DATA`
11) a. If `POST` simulate the transaction using the eth_call method with the block number 
    - If the node throws an error, not due to failed submission return `ClaimableValidatorError.SIMULATION_NODE_COULD_NOT_RUN`, this means the node has errors and is an inconclusive result
    - Get the publication count state the wallet was in on the block number submitted and add 1 to it to get the expected publication result
    - Check the expected result equals the simulated result - if not, return `ClaimableValidatorError.SIMULATION_FAILED`
    b. If `COMMENT` or `MIRROR` do some different checks, as these can only be done on other DA publications
       - Recover who signed the transaction using the typedData and the signature
       - Get the on-chain profile and nonce information from the recovered signed address on the block number submitted
         - `sigNonces`, `getPubCount`, `getDispatcher`, `ownerOf`
       - Check the `sigNonces` is equal to the nonce of the typed data - if not, return `ClaimableValidatorError.PUBLICATION_NONCE_INVALID`
       - Check the dispatcher OR the ownerOf is equal to the recovered address - if not, return `ClaimableValidatorError.PUBLICATION_SIGNER_NOT_ALLOWED`
12) Cross-check the typed data values with the `event` object to make sure it all matches up - if not, return `ClaimableValidatorError.EVENT_MISMATCH`
13) Check the `publicationId` generated matches the publication ID it should have generated - if not, return `ClaimableValidatorError.GENERATED_PUBLICATION_ID_MISMATCH`

At this point, you have done all the checks needed, and this is a valid submission! As you see, using signatures and EVM calls, we can verify the data is correct and the submitter is correct without any other third party.

### Validation error checks types and messages

The summary in the code should explain what is being checked for and what it would fail out if it doesn't match. Below is the full list of error cases

```ts
export enum ClaimableValidatorError {
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
   * This means the submitted timestamp proof does not match up to the `dataAvailabilityId`
   * or `type` or not uploaded from the submittor whitelisted wallet
   */
  // TIMESTAMP_PROOF_INVALID_UPLOAD = 'TIMESTAMP_PROOF_INVALID_UPLOAD',

  /**
   * This means the timestamp proof uploaded was not done by a valid submitter
   */
  TIMESTAMP_PROOF_NOT_SUBMITTER = 'TIMESTAMP_PROOF_NOT_SUBMITTER',

  /**
   * This means it can not read the block from the node
   */
  BLOCK_CANT_BE_READ_FROM_NODE = 'BLOCK_CANT_BE_READ_FROM_NODE',

  /**
   * This means the block stated in the chain proofs are not the closest block to the timstamp
   * proofs
   */
  // BLOCK_MISMATCH = 'BLOCK_MISMATCH',

  /**
   * This the typed data format is invalid (aka a invalid address type etc)
   */
  INVALID_FORMATTED_TYPED_DATA = 'INVALID_FORMATTED_TYPED_DATA',

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
   * This means the generated publication id for the generic id does not match
   * what it should be
   */
  GENERATED_PUBLICATION_ID_MISMATCH = 'GENERATED_PUBLICATION_ID_MISMATCH',

  /**
   * This means the pointer set in the chain proofs is not required but set anyway
   */
  INVALID_POINTER_SET_NOT_NEEDED = 'INVALID_POINTER_SET_NOT_NEEDED',

  /**
   * This means the block processed against is not the closest block to the timestamp proofs
   */
  NOT_CLOSEST_BLOCK = 'NOT_CLOSEST_BLOCK',

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
   * unknown error should not happen but catch all
   */
  UNKNOWN = 'UNKNOWN',
}
```

## Submitter flow

The flow diagram shows the submitter flows in detail; the first submitter will be within the LENS API to allow for easy integration for all. 

<img src="./images/submitter-flows.png">

## Future of decentralised submitters

This is a rough look at how this could work in the future in a trustless manner. This is not the final solution but a rough idea of how it could work on a very high-level vision.

<img src="./images/submitters-later-vision.png">

## Running the code

### Package

This is a built-in node, and this means it can be run on the client as well as a server; it won't use the DB on the client but can mean you can run proof checks in runtime, which is super powerful.

```bash
$ npm i @lens-protocol/data-availability-verifier
```

#### checkDAProof

The `checkDAProof` will return you a failure reason of the enum `ClaimableValidatorError`, and if successful, you be returned the entire `DAStructurePublication`.

```ts
import { checkDAProof, EthereumNode, Environment } from '@lens-protocol/data-availability-verifier';

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

const result = await checkDAProof(PROOF_ID, ethereumNode);
if (result.isSuccess()) {
    console.log('proof valid', result.successResult!)
    return; // all is well!
}

// it failed!
console.error('proof invalid do something', result.errorResult!)
```

#### startDAVerifierNode

This is a start watching all the DA items coming in and logging it all out in your terminal. You can use the `docker-compose up` to just run it, or you can install the package and run it on your own server.

```ts
import { startDAVerifierNode } from '@lens-protocol/data-availability-verifier';

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

// it run forever and log out to the terminal
startDAVerifierNode(ethereumNode);
```

##### Stream

If you wish to index the data yourself, you can use the `startDAVerifierNode` and stream the data out to your own DB using the `StreamCallback`:


```ts
import { startDAVerifierNode, StreamResult } from '@lens-protocol/data-availability-verifier';

const stream = (result: StreamResult) => {
  console.log('streamed publication', result);

  if(result.success) {
    // success
    console.log('reason', result.dataAvailabilityResult)
  } else {
    // failure
    console.log('reason', result.failureReason)
  }

  // insert into your DB or do something with it!
};

const ethereumNode: EthereumNode = {
  environment: Environment.POLYGON,
  nodeUrl: YOUR_NODE_URL,
};

// it run forever and log out to the terminal
startDAVerifierNode(ethereumNode, stream);
```

### Running standalone

If you wish to just run it on its own, you can just run:

```bash
$ npm i
$ npm run start
```

#### Docker

To run the docker file, just run the following:

```bash
$ docker-compose up
```

