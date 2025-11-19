// Client-side API utilities for interacting with Arkiv through serverless functions
// This keeps the private key secure on the server side

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
  fileHash?: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface UploadResponse {
  success: boolean;
  fileHash: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export class ArkivAPIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api/arkiv';
  }

  async getAllEmployees(): Promise<Employee[]> {
    const response = await fetch(`${this.baseUrl}/employees`);
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    return response.json();
  }

  async addEmployee(employee: Omit<Employee, 'id' | 'joinDate'>): Promise<Employee> {
    const response = await fetch(`${this.baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employee),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add employee');
    }
    return response.json();
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'timestamp'>): Promise<Invoice> {
    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    return response.json();
  }

  async getInvoicesByEmployee(employeeId: string): Promise<Invoice[]> {
    const response = await fetch(`${this.baseUrl}/invoices?employeeId=${employeeId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    return response.json();
  }

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }
    return response.json();
  }
}

// Export a singleton instance
export const arkivClient = new ArkivAPIClient();
