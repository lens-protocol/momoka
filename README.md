# Data availability verifier

This is a project which shows you how you can trustlessly verify the DA of actions when using DA layer on lens.

## What is DA

DA stands for Data Availability. It is a concept of storing the data in an availability decentraslied layer which is a lot cheaper then storing it on-chain. This can store certain actions like POSTS, COMMENTS, MIRRORS etc..  

If you want to verify that a certain action COULD have been executed on-chain, you can use DA layer to verify it. The idea is that you do the same signing actions as you would on-chain but you never actually send the signature. You build up a DA standard which has the proofs with all the information you need. This then allows ANYONE to cross check which the information, doing so allows you to 100% prove that this action must of been actioned by someone who could create the signatures and submit it as you can fork the chain and send the transaction. This allows LENS to scale but still have the core message of "ownership" and "trust" which the blockchain provides.

## How does it work

TODO

## How to use

TODO

## Unanswered questions:

3) If you try to comment on an on-chain publication it throws an error for now - fine
4) If you mirror a DA post you run the proofs on the pointer and not the actual mirror itself (as would fail on-chain)
5) DA comments only work on DA posts/comments
6) If you comment the proofs run on the main publication
7) if you comment on a DA comment the proofs will run on the main publication and then do offline checks for the comment itself (like signature was signed)

DA proofs flow where we cant submit the tx as it would fail:

1. check if bundlr timestamp proofs are valid verified against node
2. get the closest block to the timestamp (write docs)
3. compare block numbers to make sure they are the same
4. check the pointers are valid first (for example the post on a comment)
5. eerecover the address of the signature
6. check this address COULD do an action on the block number (if its a dispatcher OR the owner)
7. check the nonce is correct
8. check all the info in typed data value compares well to event emitted
9. grab the profiles pub count from block number to make sure the pubId is +1 correctly
10. done!

## Flag

DA mirror should only be able to be done on DA posts and comments
