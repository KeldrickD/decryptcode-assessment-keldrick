# DecryptCode Web3 Assessment

Assessment project for the Senior Web3 & Blockchain Engineer position.

## Quick Start

```bash
npm run install:all
npm start
```

- **Backend:** http://localhost:3001 (mock data loads on start)
- **Frontend:** http://localhost:3000

## Completed Tasks

1. **Backend:** `GET /api/projects?status=...` filter (case-insensitive)
2. **Backend:** `GET /api/wallets/:address/transactions` (400/404/200 semantics, registry-aware)
3. **Solidity:** `SECURITY_REVIEW.md` with findings and mitigations
4. **Frontend:** Wallet-connected transaction table (loading/error/empty states)
5. **UI:** Spinner + card polish

## API Notes

### Projects

- `GET /api/projects` — list all projects
- `GET /api/projects?status=active` — filter by status (active, in-progress, archived; case-insensitive)

### Wallet Transactions

- **Invalid wallet format** (e.g. `abc`) → `400`
- **Unknown wallet** (not in registry) → `404`
- **Known wallet with no tx** → `200` with `{ success: true, data: [], count: 0 }`
- **Known wallet with tx** → `200` with `{ success: true, data: [...], count: N }`

**Demo tip:** Connect a wallet address present in the mock data for the transaction list to appear. Addresses like `0x1234567890abcdef1234567890abcdef12345678` are in the seed data.

## Decision Notes

The wallet transactions endpoint resolves the spec ambiguity (404 vs 200[]) by consulting the wallet registry: valid format + wallet not found → 404; valid wallet found + no transactions → 200 []. This treats the wallets store as the source of truth for "known" addresses, so responses stay consistent and reviewers can reason about behavior without edge cases.

## Project Structure

```
decryptcode/
├── ASSESSMENT.md        # Task instructions
├── SECURITY_REVIEW.md   # Solidity security findings
├── backend/             # Node.js + Express API
│   ├── config/          # Mock data store (loads on npm start)
│   └── routes/          # API routes
├── frontend/            # React app
└── contracts/           # Solidity smart contract
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/projects | List projects (optional `?status=`) |
| GET | /api/projects?status=active | Filter by status |
| GET | /api/transactions | List transactions |
| GET | /api/wallets | List wallets |
| GET | /api/wallets/:address/transactions | Transactions for wallet (sender or receiver) |

See **ASSESSMENT.md** for full task details.
