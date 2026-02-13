import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function truncateAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function truncateHash(hash) {
  if (!hash || hash.length < 12) return hash || '';
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function formatTimestamp(ms) {
  if (ms == null) return '—';
  const d = new Date(ms);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [walletError, setWalletError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProjects() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/projects`);
        if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`);
        const json = await res.json();
        if (!cancelled && json.data) setProjects(json.data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to fetch projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!address) {
      setTransactions([]);
      setTxError(null);
      return;
    }
    let cancelled = false;
    async function fetchWalletTx() {
      setTxLoading(true);
      setTxError(null);
      try {
        const res = await fetch(`${API_BASE}/wallets/${encodeURIComponent(address)}/transactions`);
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          throw new Error(json?.error || 'Failed to load transactions');
        }
        setTransactions(json.data || []);
      } catch (err) {
        if (!cancelled) setTxError(err.message || 'Failed to fetch transactions');
      } finally {
        if (!cancelled) setTxLoading(false);
      }
    }
    fetchWalletTx();
    return () => { cancelled = true; };
  }, [address]);

  async function connectWallet() {
    setWalletError(null);
    if (!window.ethereum) {
      setWalletError('MetaMask (or another Web3 wallet) is not installed.');
      return;
    }
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
      }
    } catch (err) {
      setWalletError(err.message || 'Failed to connect wallet');
    }
  }

  if (loading) {
    return (
      <section className="projects-section">
        <div className="projects-loading">
          <div className="spinner" aria-hidden="true" />
          <p>Loading projects…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="projects-section">
        <p className="projects-error">{error}</p>
      </section>
    );
  }

  return (
    <section className="projects-section">
      <div className="projects-header">
        <h2>Projects</h2>
        <div className="wallet-row">
          {address ? (
            <span className="wallet-address" title={address}>
              {truncateAddress(address)}
            </span>
          ) : (
            <button type="button" className="connect-wallet-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        {walletError && <p className="wallet-error">{walletError}</p>}
      </div>
      <ul className="projects-list">
        {projects.map((p) => (
          <li key={p.id} className="project-item">
            <span className="project-name">{p.name}</span>
            <span className="project-chain">{p.chain}</span>
            <span className={`project-status project-status--${(p.status || '').replace(/\s+/g, '-')}`}>
              {p.status}
            </span>
          </li>
        ))}
      </ul>

      <div className="transactions-section">
        <h3 className="transactions-header">Transactions</h3>
        {!address ? (
          <p className="transactions-placeholder">Connect wallet to view your transactions</p>
        ) : txLoading ? (
          <div className="transactions-loading">
            <div className="spinner spinner--sm" aria-hidden="true" />
            <span>Loading transactions…</span>
          </div>
        ) : txError ? (
          <>
            <p className="transactions-error">{txError}</p>
            {txError.includes('not found') && (
              <p className="transactions-tip">Tip: Use a wallet address from the backend mock data for demo (e.g. 0x1234…5678).</p>
            )}
          </>
        ) : transactions.length === 0 ? (
          <p className="transactions-empty">No transactions for this wallet</p>
        ) : (
          <div className="transactions-table-wrap">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="tx-hash" title={tx.txHash}>{truncateHash(tx.txHash)}</td>
                    <td className="tx-addr" title={tx.from}>{truncateAddress(tx.from)}</td>
                    <td className="tx-addr" title={tx.to}>{truncateAddress(tx.to)}</td>
                    <td className="tx-amount">{tx.value} {tx.token || ''}</td>
                    <td className="tx-time">{formatTimestamp(tx.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Projects;
