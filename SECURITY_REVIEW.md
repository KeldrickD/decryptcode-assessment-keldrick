# Security Review — SimpleToken.sol

## Finding 1: ERC20 Approval Race Condition

**Severity:** Medium  

**Description:** The `approve()` function allows overwriting an existing non-zero allowance in a single transaction. This enables a well-known front-running attack: when a user attempts to reduce allowance from 100 to 50, a malicious spender can observe the pending transaction, front-run it with a `transferFrom` for the full 100, then the user's approval change takes effect—but the spender has already drained the original amount. The current implementation lacks the commonly recommended mitigation (requiring allowance to be zero before changing, or using `increaseAllowance`/`decreaseAllowance` helpers).

**Recommendation:** Follow OpenZeppelin's approach: require the caller to set allowance to zero before changing a non-zero value, or introduce `increaseAllowance` and `decreaseAllowance` functions that atomically adjust allowances and eliminate the race.

---

## Finding 2: Missing Zero-Address Validation

**Severity:** Medium  

**Description:** The contract does not validate that `to` and `spender` are non-zero addresses. In `transfer()` and `transferFrom()`, sending tokens to `address(0)` burns them permanently (tokens are lost with no control mechanism). In `approve()`, approving `address(0)` as a spender is meaningless and can cause confusion or integration bugs with off-chain indexing and UIs. While burning to zero can be intentional in some designs, failing to guard against it here makes accidental loss of funds more likely.

**Recommendation:** Add `require(to != address(0), "Transfer to zero address")` in `transfer()` and `transferFrom()`, and `require(spender != address(0), "Approve to zero address")` in `approve()` before performing state changes.
