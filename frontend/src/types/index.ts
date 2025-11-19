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

export interface Invoice {
  id: string;
  employeeId: string;
  amount: number;
  currency: string;
  description: string;
  fileHash: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'paid';
}
