export interface Employee {
  id: string;
  walletAddress: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  chainPreference: string;
  joinDate: string;
}

// This file only exports types, actual data fetching is done through API routes
// to keep the private key secure on the server side
