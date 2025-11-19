export interface Employee {
  id: string; // entityKey from Arkiv
  employeeNumber: number; // Index in contract
  walletAddress: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  totalPaid: number;
  invoiceCount: number;
  joinDate: string;
}

export interface Invoice {
  id: string; // entityKey from Arkiv
  invoiceNumber: number; // Invoice ID from contract
  employeeAddress: string; // Employee wallet address
  employeeNumber: number; // Index in contract
  amount: string; // Amount in wei (for USDC: 6 decimals)
  token: string; // Token contract address
  description: string;
  paid: boolean; // Payment status from contract
  chainId: number; // Chain ID (534351 for Scroll Sepolia)
  timestamp: string;
}
