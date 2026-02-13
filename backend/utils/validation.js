/**
 * Validate EVM address format: 0x followed by 40 hex chars.
 */
function isEvmAddress(addr) {
  return typeof addr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(addr);
}

module.exports = { isEvmAddress };
