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

export class ArkivService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getAllEmployees(): Promise<Employee[]> {
    // Mock data for demo
    return [
      {
        id: '1',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'Developer',
        salary: 5000,
        chainPreference: 'Scroll',
        joinDate: new Date().toISOString(),
      },
      {
        id: '2',
        walletAddress: '0x9876543210abcdef9876543210abcdef98765432',
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'Designer',
        salary: 4500,
        chainPreference: 'Polygon',
        joinDate: new Date().toISOString(),
      },
    ];
  }
}
