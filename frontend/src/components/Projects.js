import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function truncateAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);
  const [walletError, setWalletError] = useState(null);

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
    </section>
  );
}

export default Projects;
