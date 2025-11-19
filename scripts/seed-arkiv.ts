import * as dotenv from 'dotenv';
import { resolve } from 'path';
const { createWalletClient, http } = require('@arkiv-network/sdk');
const { privateKeyToAccount } = require('@arkiv-network/sdk/accounts');
const { mendoza } = require('@arkiv-network/sdk/chains');
const { jsonToPayload, ExpirationTime } = require('@arkiv-network/sdk/utils');

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const privateKey = `0x${process.env.PRIVATE_KEY!}`;

// Create Arkiv wallet client
const walletClient = createWalletClient({
  chain: mendoza,
  transport: http(),
  account: privateKeyToAccount(privateKey),
});

// Sample employees to seed (matching contract Employee struct)
const employees = [
  {
    employeeNumber: 0,
    walletAddress: '0x6BbFd1F6dC17322a6e8923cf8072a735A081a975',
    name: 'Alice Johnson',
    email: 'alice@payflow.dev',
    role: 'Senior Developer',
    active: true,
    totalPaid: 0,
    invoiceCount: 0,
    joinDate: new Date().toISOString(),
  },
  {
    employeeNumber: 1,
    walletAddress: '0x0DBA585a86bb828708b14d2F83784564Ae03a5d0',
    name: 'Bob Smith',
    email: 'bob@payflow.dev',
    role: 'UI/UX Designer',
    active: true,
    totalPaid: 0,
    invoiceCount: 0,
    joinDate: new Date().toISOString(),
  },
  {
    employeeNumber: 2,
    walletAddress: '0xB3D6f8C9BE8c7c4aE9aE5f124f7a70C285d3c076',
    name: 'Carol Martinez',
    email: 'carol@payflow.dev',
    role: 'Product Manager',
    active: true,
    totalPaid: 0,
    invoiceCount: 0,
    joinDate: new Date().toISOString(),
  },
];

// Sample invoices (matching contract Invoice struct)
// Note: Amounts in wei (6 decimals for USDC)
const USDC_ADDRESS = '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'; // Scroll Sepolia USDC
const invoices = [
  {
    invoiceNumber: 0,
    employeeAddress: '0x6BbFd1F6dC17322a6e8923cf8072a735A081a975',
    employeeNumber: 0,
    amount: '5000000000', // 5000 USDC (6 decimals)
    token: USDC_ADDRESS,
    description: 'November 2025 Salary',
    paid: false,
    chainId: 534351, // Scroll Sepolia
    timestamp: new Date().toISOString(),
  },
  {
    invoiceNumber: 1,
    employeeAddress: '0x0DBA585a86bb828708b14d2F83784564Ae03a5d0',
    employeeNumber: 1,
    amount: '4500000000', // 4500 USDC (6 decimals)
    token: USDC_ADDRESS,
    description: 'November 2025 Salary',
    paid: false,
    chainId: 534351,
    timestamp: new Date().toISOString(),
  },
  {
    invoiceNumber: 2,
    employeeAddress: '0xB3D6f8C9BE8c7c4aE9aE5f124f7a70C285d3c076',
    employeeNumber: 2,
    amount: '5500000000', // 5500 USDC (6 decimals)
    token: USDC_ADDRESS,
    description: 'November 2025 Salary',
    paid: true,
    chainId: 534351,
    timestamp: new Date().toISOString(),
  },
];

async function seedData() {
  console.log('🌱 Seeding Arkiv with employee and invoice data...\n');

  try {
    // Seed employees
    console.log('📝 Creating employees...');
    for (const employee of employees) {
      try {
        const { entityKey } = await walletClient.createEntity({
          payload: jsonToPayload(employee),
          contentType: 'application/json',
          attributes: [
            { key: 'type', value: 'employee' },
            { key: 'employeeNumber', value: employee.employeeNumber.toString() },
            { key: 'walletAddress', value: employee.walletAddress },
            { key: 'active', value: employee.active.toString() },
          ],
          expiresIn: ExpirationTime.fromYears(10),
        });
        console.log(`✅ Created employee #${employee.employeeNumber}: ${employee.name} (${entityKey})`);
      } catch (error) {
        console.error(`❌ Error creating employee ${employee.name}:`, error);
      }
    }

    // Seed invoices
    console.log('\n📄 Creating invoices...');
    for (const invoice of invoices) {
      try {
        const { entityKey } = await walletClient.createEntity({
          payload: jsonToPayload(invoice),
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
          expiresIn: ExpirationTime.fromYears(10),
        });
        console.log(`✅ Created invoice #${invoice.invoiceNumber}: ${invoice.description} - ${invoice.paid ? 'PAID' : 'UNPAID'} (${entityKey})`);
      } catch (error) {
        console.error(`❌ Error creating invoice ${invoice.description}:`, error);
      }
    }

    console.log('\n✨ Data seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seed script
seedData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
