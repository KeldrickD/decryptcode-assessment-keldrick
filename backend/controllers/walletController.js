const { getWallets, getWalletsByAddress, getTransactions } = require('../config/store');
const { isEvmAddress } = require('../utils/validation');

/**
 * List all wallet balances.
 * Query params: address (filter by address), chainId
 */
function listWallets(req, res, next) {
  try {
    let wallets = getWallets();
    const { address, chainId } = req.query;

    if (address) {
      wallets = getWalletsByAddress(address);
    }

    if (chainId) {
      wallets = wallets.filter((w) => String(w.chainId) === String(chainId));
    }

    res.json({ success: true, data: wallets, count: wallets.length });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all transactions where the given address is sender or receiver.
 * 400 if address format invalid; 404 if wallet not in registry; 200 with array otherwise.
 */
function getTransactionsByWallet(req, res, next) {
  try {
    const { address } = req.params;

    if (!isEvmAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format',
      });
    }

    const needle = address.toLowerCase();

    const walletExists = getWalletsByAddress(needle).length > 0;
    if (!walletExists) {
      return res.status(404).json({
        success: false,
        error: 'Wallet address not found',
      });
    }

    const transactions = getTransactions();
    const matches = transactions.filter((tx) => {
      const from = String(tx.from || '').toLowerCase();
      const to = String(tx.to || '').toLowerCase();
      return from === needle || to === needle;
    });

    res.json({ success: true, data: matches, count: matches.length });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listWallets,
  getTransactionsByWallet,
};
