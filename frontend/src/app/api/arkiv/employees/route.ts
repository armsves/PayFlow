import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - prevent static generation at build time
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

class ArkivServerService {
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

  async getAllEmployees(): Promise<Employee[]> {
    try {
      // Create public client for read-only queries
      const publicClient = this.sdk.createPublicClient({
        chain: this.sdk.mendoza,
        transport: this.sdk.http(),
      });

      // Query entities with type=employee using buildQuery
      const query = publicClient.buildQuery();
      const result = await query
        .where(this.sdk.eq('type', 'employee'))
        .withPayload(true)
        .fetch();

      const employees = result.entities.map((entity: any) => {
        // Parse the payload - it's stored as JSON string
        const payloadText = new TextDecoder().decode(entity.payload);
        const data = JSON.parse(payloadText);
        return {
          id: entity.entityKey,
          ...data,
        };
      });

      // Sort by employeeNumber
      return employees.sort((a: Employee, b: Employee) => a.employeeNumber - b.employeeNumber);
    } catch (error) {
      console.error('Error fetching from Arkiv:', error);
      return [];
    }
  }

  async addEmployee(employee: Omit<Employee, 'id' | 'joinDate'>): Promise<Employee> {
    const newEmployee = {
      ...employee,
      joinDate: new Date().toISOString(),
    };

    try {
      const { entityKey } = await this.walletClient.createEntity({
        payload: this.sdk.jsonToPayload(newEmployee),
        contentType: 'application/json',
        attributes: [
          { key: 'type', value: 'employee' },
          { key: 'employeeNumber', value: employee.employeeNumber.toString() },
          { key: 'walletAddress', value: employee.walletAddress },
          { key: 'active', value: employee.active.toString() },
        ],
        expiresIn: this.sdk.ExpirationTime.fromYears(10),
      });

      return {
        id: entityKey,
        ...newEmployee,
      };
    } catch (error) {
      console.error('Error adding to Arkiv:', error);
      throw error;
    }
  }
}

// GET /api/arkiv/employees - Get all employees
export async function GET(request: NextRequest) {
  try {
    const privateKey = `0x${process.env.PRIVATE_KEY}`;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    const arkiv = new ArkivServerService(privateKey);
    const employees = await arkiv.getAllEmployees();

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST /api/arkiv/employees - Add new employee
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
    const { employeeNumber, walletAddress, name, email, role, active, totalPaid, invoiceCount } = body;

    if (employeeNumber === undefined || !walletAddress || !name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const arkiv = new ArkivServerService(privateKey);
    const newEmployee = await arkiv.addEmployee({
      employeeNumber: employeeNumber || 0,
      walletAddress,
      name,
      email,
      role,
      active: active !== undefined ? active : true,
      totalPaid: totalPaid || 0,
      invoiceCount: invoiceCount || 0,
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json(
      { error: 'Failed to add employee' },
      { status: 500 }
    );
  }
}
