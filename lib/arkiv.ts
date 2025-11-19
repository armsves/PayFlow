export interface EmployeeProfile {
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

export class ArkivService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.arkiv.dev';
  }

  async addEmployee(profile: EmployeeProfile): Promise<string> {
    const response = await fetch(`${this.baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    });

    const data = await response.json();
    return data.id;
  }

  async getEmployee(walletAddress: string): Promise<EmployeeProfile | null> {
    const response = await fetch(`${this.baseUrl}/employees/${walletAddress}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) return null;
    return await response.json();
  }

  async getAllEmployees(): Promise<EmployeeProfile[]> {
    const response = await fetch(`${this.baseUrl}/employees`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    return await response.json();
  }

  async createInvoice(invoice: Invoice): Promise<string> {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });

    const data = await response.json();
    return data.id;
  }

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data.hash;
  }
}
