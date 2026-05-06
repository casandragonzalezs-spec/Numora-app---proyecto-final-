# Numora Security Specification

## Data Invariants
1. A transaction must belong to an existing account owned by the same user.
2. Users can only read/write their own profiles, accounts, transactions, budgets, and insights.
3. Account balances must be updated correctly when transactions are added (Handled by client but validated by rules for data integrity).
4. `userId` fields are immutable after creation.
5. `createdAt` fields are immutable after creation.

## The Dirty Dozen (Malicious Payloads)
1. **Identity Spoofing**: Creating a transaction with `userId: "attacker_id"` but `auth.uid` is `victim_uid`.
2. **Account Hijacking**: Setting `accountId` to a victim's account in a transaction.
3. **Ghost Fields**: Adding `isVerified: true` to a user profile.
4. **ID Poisoning**: Injecting 1MB strings as document IDs for accounts.
5. **Privilege Escalation**: Trying to create an `Insight` for another user.
6. **Denial of Wallet**: Sending 10MB arrays in the `tags` field of a transaction.
7. **Negative Balance Hack**: Creating a transaction with a negative amount that shouldn't be possible (Wait, transactions can be negative? No, type determines direction).
8. **Orphaned Record**: Creating a transaction for an account ID that doesn't exist.
9. **Timestamp Manipulation**: Manually setting `createdAt` to 2010.
10. **Resource Exhaustion**: Creating 1 million accounts (Hard to block with just rules, but can limit text sizes).
11. **Shadow Update**: Updating a transaction's `userId` to transfer it to another account.
12. **Null Bypass**: Sending `null` for required fields.

## Test Runner (Logic Check)
The `firestore.rules` must ensure these payloads return `PERMISSION_DENIED`.
