# PayFlow

**The Global Decentralized Payroll Platform**

PayFlow enables organizations to manage global teams and execute cross-chain payments seamlessly. By leveraging L2 scalability, decentralized data storage, and cross-chain interoperability, PayFlow solves the fragmentation of crypto payroll.

## 🌟 Key Features

### 🌍 Global & Cross-Chain
- **Unified Payment Ledger**: Built on **Scroll L2** for low-cost, transparent payment tracking.
- **Any Chain, Any Token**: Powered by **LiFi** and **Wormhole**, allowing employers to pay from their preferred chain while employees receive funds on theirs.
- **Smart Routing**: Automatic optimization of bridging routes for lowest fees and fastest execution.

### 📱 Mobile-First & Accessible
- **Mini App Integration**: Designed as a **Lemon Cash Mini App** for a native mobile experience.
- **Seamless Onboarding**: Email-based wallet creation and fiat on-ramps via **Crossmint**, making crypto payroll accessible to non-native users.

### 🔒 Decentralized Data & Compliance
- **Verifiable Records**: Employee data and invoice files are stored on **Arkiv (Golem)**, ensuring data sovereignty, privacy, and permanence without centralized servers.
- **Automated Invoicing**: Smart contract-driven invoice generation and status tracking.

## 🏗 Architecture

PayFlow orchestrates a complex stack of protocols to deliver a simple user experience:

1.  **Frontend**: Next.js application serving as the dashboard and Lemon Mini App interface.
2.  **Data Layer**: **Arkiv** acts as the decentralized backend, indexing employee profiles and invoice metadata.
3.  **Execution Layer**: **Scroll** smart contracts manage the state of payment rounds and payment approvals.
4.  **Bridge Layer**: **LiFi** and **Wormhole** contracts execute the actual value transfer across chains (e.g., Mainnet USDC -> Arbitrum USDC).

## 🛠 Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity, Hardhat
- **Blockchain**: Scroll Sepolia (L2)
- **Cross-Chain**: LiFi, Wormhole
- **Storage**: Arkiv (Golem Network)
- **Onboarding**: Crossmint
- **Integration**: Lemon Cash SDK

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM or Yarn
- A standard Web3 wallet (Metamask, Rabby) or Email (via Crossmint)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/payflow/payflow.git
    cd payflow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    cd frontend && npm install && cd ..
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root and `frontend` directories based on `.env.example`.

### Deployment (Smart Contracts)

Compile and deploy the payroll contracts to Scroll Sepolia.

```bash
# Compile contracts
npx hardhat compile

# Deploy to Scroll Sepolia
npx hardhat run scripts/deploy.ts --network scroll-sepolia
```

### Running the Application

Start the local development server.

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the PayFlow dashboard.

## 📄 License

This project is licensed under the MIT License.
