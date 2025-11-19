# PayFlow Architecture

## Technology Stack

- **Smart Contracts**: Solidity 0.8.20
- **Deployment**: Hardhat + TypeScript
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain**: Scroll L2

## Smart Contracts

### PayrollManager
Core contract managing employees and invoices on Scroll L2.

### CrossChainPaymentExecutor
Handles cross-chain payment execution via Wormhole and LiFi.

## Frontend

Next.js 14 application with:
- Server-side rendering
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive mobile-first design

## Integration Services

- **Arkiv**: Employee and invoice data storage
- **Wormhole**: Cross-chain messaging
- **LiFi**: DEX/bridge aggregation
- **Crossmint**: Wallet onboarding
- **Lemon**: Mini app SDK
- **Mimic**: Payment automation
