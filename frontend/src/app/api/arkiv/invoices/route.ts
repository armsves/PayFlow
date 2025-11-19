import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - prevent static generation at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

// Lazy load Arkiv SDK to prevent build-time execution
function getArkivSDK() {
  if (typeof window !== 'undefined') {
    throw new Error('Arkiv SDK should only be used server-side');
  }
  const { createWalletClient, createPublicClient, http } = require('@arkiv-network/sdk');
  const { privateKeyToAccount } = require('@arkiv-network/sdk/accounts');
  const { mendoza } = require('@arkiv-network/sdk/chains');
  const { jsonToPayload, ExpirationTime } = require('@arkiv-network/sdk/utils');
  const { eq } = require('@arkiv-network/sdk/query');
  return { createWalletClient, createPublicClient, http, privateKeyToAccount, mendoza, jsonToPayload, ExpirationTime, eq };
}

class ArkivInvoiceService {
  private walletClient: any;
  private sdk: any;

  constructor(privateKey: string) {
    this.sdk = getArkivSDK();
    this.walletClient = this.sdk.createWalletClient({
      chain: this.sdk.mendoza,
      transport: this.sdk.http(),
      account: this.sdk.privateKeyToAccount(privateKey),
    });
  }

  async createInvoice(invoice: Omit<Invoice, 'id' | 'timestamp'>): Promise<Invoice> {
    const newInvoice = {
      ...invoice,
      timestamp: new Date().toISOString(),
    };

    try {
      const { entityKey } = await this.walletClient.createEntity({
        payload: this.sdk.jsonToPayload(newInvoice),
        contentType: 'application/json',
        attributes: [
          { key: 'type', value: 'invoice' },
          { key: 'invoiceNumber', value: invoice.invoiceNumber.toString() },
          { key: 'employeeNumber', value: invoice.employeeNumber.toString() },
          { key: 'employeeAddress', value: invoice.employeeAddress },
          { key: 'amount', value: invoice.amount },
          { key: 'paid', value: invoice.paid.toString() },
          { key: 'chainId', value: invoice.chainId.toString() },
        ],
        expiresIn: this.sdk.ExpirationTime.fromYears(10),
      });

      return {
        id: entityKey,
        ...newInvoice,
      };
    } catch (error) {
      console.error('Error creating invoice in Arkiv:', error);
      throw error;
    }
  }

  async getInvoicesByEmployee(employeeAddress: string): Promise<Invoice[]> {
    try {
      // Create public client for read-only queries
      const publicClient = this.sdk.createPublicClient({
        chain: this.sdk.mendoza,
        transport: this.sdk.http(),
      });

      // Query entities with type=invoice and matching employeeAddress using buildQuery
      const query = publicClient.buildQuery();
      const result = await query
        .where(this.sdk.eq('type', 'invoice'))
        .where(this.sdk.eq('employeeAddress', employeeAddress.toLowerCase()))
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
      return invoices.sort((a: Invoice, b: Invoice) => a.invoiceNumber - b.invoiceNumber);
    } catch (error) {
      console.error('Error fetching invoices from Arkiv:', error);
      return [];
    }
  }
}

// POST /api/arkiv/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const privateKey = `0x${process.env.PRIVATE_KEY}`;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { invoiceNumber, employeeAddress, employeeNumber, amount, token, description, paid, chainId } = body;

    if (invoiceNumber === undefined || !employeeAddress || !amount || !token || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const arkiv = new ArkivInvoiceService(privateKey);
    const newInvoice = await arkiv.createInvoice({
      invoiceNumber,
      employeeAddress,
      employeeNumber: employeeNumber || 0,
      amount,
      token,
      description,
      paid: paid || false,
      chainId: chainId || 534351,
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
    const privateKey = `0x${process.env.PRIVATE_KEY}`;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const employeeAddress = searchParams.get('employeeAddress');

    if (!employeeAddress) {
      return NextResponse.json(
        { error: 'Missing employeeAddress parameter' },
        { status: 400 }
      );
    }

    const arkiv = new ArkivInvoiceService(privateKey);
    const invoices = await arkiv.getInvoicesByEmployee(employeeAddress);

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
