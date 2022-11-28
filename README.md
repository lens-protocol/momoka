# Data availability verifier

This is a project which shows you how you can trustlessly verify the DA of actions when using DA layer on lens.

## What is DA

DA stands for Data Availability. It is a concept of storing the data in an availability decentraslied layer which is a lot cheaper then storing it on-chain. This can store certain actions like POSTS, COMMENTS, MIRRORS etc.

If you want to verify that a certain action COULD have been executed on-chain, you can use DA layer to verify it. The idea is that you do the same signing actions as you would on-chain but you never actually send the signature. You build up a DA standard which has the proofs with all the information you need. This then allows ANYONE to cross check which the information, doing so allows you to 100% prove that this action must of been actioned by someone who could create the signatures and submit it as you can fork the chain and send the transaction. This allows LENS to scale but still have the core message of "ownership" and "trust" which the blockchain provides.

## How does it work

TODO

## How to use

TODO
