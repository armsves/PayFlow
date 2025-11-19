import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - prevent static generation at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export interface Invoice {
  id: string;
  invoiceNumber: number;
  employeeAddress: string;
  employeeNumber: number;
  amount: string;
  token: string;
  description: string;
  paid: boolean;
  chainId: number;
  timestamp: string;
}

// Lazy load Arkiv SDK to prevent build-time execution
function getArkivSDK() {
  if (typeof window !== 'undefined') {
    throw new Error('Arkiv SDK should only be used server-side');
  }
  const { createPublicClient, http } = require('@arkiv-network/sdk');
  const { mendoza } = require('@arkiv-network/sdk/chains');
  const { eq } = require('@arkiv-network/sdk/query');
  return { createPublicClient, http, mendoza, eq };
}

// GET /api/arkiv/invoices/all - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const sdk = getArkivSDK();
    
    // Create public client for read-only queries (no private key needed)
    const publicClient = sdk.createPublicClient({
      chain: sdk.mendoza,
      transport: sdk.http(),
    });

    // Query all invoice entities using buildQuery
    const query = publicClient.buildQuery();
    const result = await query
      .where(sdk.eq('type', 'invoice'))
      .withPayload(true)
      .fetch();

    const invoices = result.entities.map((entity: any) => {
      // Parse the payload - it's stored as JSON string
      const payloadText = new TextDecoder().decode(entity.payload);
      const data = JSON.parse(payloadText);
      return {
        id: entity.entityKey,
        ...data,
      };
    });

    // Sort by invoice number
    const sortedInvoices = invoices.sort((a: Invoice, b: Invoice) => a.invoiceNumber - b.invoiceNumber);

    return NextResponse.json(sortedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
