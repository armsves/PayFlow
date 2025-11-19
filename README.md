# PayFlow - Cross-Chain Payroll Platform

🏆 **ETH Argentina Hackathon - Tierra de Buidlers 2025**

## Overview

PayFlow is a decentralized payroll platform that enables companies to manage and execute employee payments across multiple blockchain networks.

## 🎯 Sponsor Integrations

- **Lemon Cash**: Mini App SDK for mobile-first payroll interface
- **Arkiv (Golem)**: Decentralized database for employee records and invoice files
- **Wormhole**: Cross-chain message passing and token bridging
- **LiFi**: DEX and bridge aggregation for optimal payment routes
- **Scroll**: L2 ledger for invoice tally and payment tracking
- **Crossmint**: Email wallet onboarding and fiat onramp
- **Mimic**: Automated recurring payment execution strategies

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Compile Contracts
```bash
npx hardhat compile
```

### Deploy to Scroll Sepolia
```bash
npx hardhat run scripts/deploy.ts --network scroll-sepolia
```

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
payflow/
├── contracts/              # Solidity smart contracts
├── scripts/               # Deployment scripts (TypeScript)
├── test/                  # Contract tests (TypeScript)
├── lib/                   # Integration libraries (TypeScript)
├── frontend/              # Next.js Mini App
└── docs/                  # Documentation
```

## 🏗️ Technology Stack

- **Smart Contracts**: Solidity 0.8.20
- **Deployment**: Hardhat + TypeScript
- **Frontend**: Next.js 14 + TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Scroll L2

## 📝 License

MIT
