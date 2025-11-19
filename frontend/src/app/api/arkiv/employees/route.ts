import { NextRequest, NextResponse } from 'next/server';

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

class ArkivServerService {
  private privateKey: string;
  private baseUrl: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
    this.baseUrl = 'https://api.arkiv.dev';
  }

  async getAllEmployees(): Promise<Employee[]> {
    // For now, return mock data
    // TODO: Integrate with actual Arkiv API using private key authentication
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

  async addEmployee(employee: Omit<Employee, 'id' | 'joinDate'>): Promise<Employee> {
    // TODO: Integrate with actual Arkiv API
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
      joinDate: new Date().toISOString(),
    };
    return newEmployee;
  }
}

// GET /api/arkiv/employees - Get all employees
export async function GET(request: NextRequest) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    
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
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { walletAddress, name, email, role, salary, chainPreference } = body;

    if (!walletAddress || !name || !email || !role || !salary || !chainPreference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const arkiv = new ArkivServerService(privateKey);
    const newEmployee = await arkiv.addEmployee({
      walletAddress,
      name,
      email,
      role,
      salary,
      chainPreference,
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
