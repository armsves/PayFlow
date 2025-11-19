import { NextRequest, NextResponse } from 'next/server';

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

class ArkivInvoiceService {
  private privateKey: string;
  private baseUrl: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
    this.baseUrl = 'https://api.arkiv.dev';
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'timestamp'>): Promise<Invoice> {
    // TODO: Integrate with actual Arkiv API
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    return newInvoice;
  }

  async getInvoicesByEmployee(employeeId: string): Promise<Invoice[]> {
    // TODO: Integrate with actual Arkiv API
    return [];
  }
}

// POST /api/arkiv/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { employeeId, amount, currency, description, fileHash, status } = body;

    if (!employeeId || !amount || !currency || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const arkiv = new ArkivInvoiceService(privateKey);
    const newInvoice = await arkiv.createInvoice({
      employeeId,
      amount,
      currency,
      description,
      fileHash,
      status: status || 'pending',
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// GET /api/arkiv/invoices?employeeId=xxx - Get invoices by employee
export async function GET(request: NextRequest) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Missing employeeId parameter' },
        { status: 400 }
      );
    }

    const arkiv = new ArkivInvoiceService(privateKey);
    const invoices = await arkiv.getInvoicesByEmployee(employeeId);

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
