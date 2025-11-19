import { ethers } from 'hardhat';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const PAYROLL_MANAGER_ADDRESS = process.env.PAYROLL_MANAGER_ADDRESS!;
const USDC_ADDRESS = '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4'; // Scroll Sepolia USDC

// Match the employees from Arkiv seed
const employees = [
  {
    address: '0x6BbFd1F6dC17322a6e8923cf8072a735A081a975',
    name: 'Alice Johnson',
    arkivHash: '0x2a39a9a62abe8719d449966d3865ded03d8ef355de377d97425302ca7c515453',
  },
  {
    address: '0x0DBA585a86bb828708b14d2F83784564Ae03a5d0',
    name: 'Bob Smith',
    arkivHash: '0x3d6bba8b9f59df56f75a740a31bedfa6306125f0193a312b89cf6be0142cfca0',
  },
  {
    address: '0xB3D6f8C9BE8c7c4aE9aE5f124f7a70C285d3c076',
    name: 'Carol Martinez',
    arkivHash: '0x5047bb2497b665f885a51c976b6ce41008b985fba10c26cdfd2c32310d46b7ab',
  },
];

// Match the invoices from Arkiv seed
const invoices = [
  {
    employeeAddress: '0x6BbFd1F6dC17322a6e8923cf8072a735A081a975',
    amount: ethers.parseUnits('5000', 6), // 5000 USDC
    arkivHash: '0x35444fe8ae5aa3c022162e6521035a15bad414e1a46f1e27f6c67b5b014c0b14',
    description: 'November 2025 Salary - Alice',
  },
  {
    employeeAddress: '0x0DBA585a86bb828708b14d2F83784564Ae03a5d0',
    amount: ethers.parseUnits('4500', 6), // 4500 USDC
    arkivHash: '0xa94c1d7b1370c9b5a3cc55455df602b7ad82bdf0cccb08aa93e7b7d52a42d5e9',
    description: 'November 2025 Salary - Bob',
  },
  {
    employeeAddress: '0xB3D6f8C9BE8c7c4aE9aE5f124f7a70C285d3c076',
    amount: ethers.parseUnits('5500', 6), // 5500 USDC
    arkivHash: '0x5905bc0dd9d061a66d9fe62d268a400a38b4e7e9b04ece48c7ced516b6402fc5',
    description: 'November 2025 Salary - Carol',
  },
];

async function main() {
  console.log('🌱 Seeding PayrollManager contract on Scroll Sepolia...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);

  // Get contract instance
  const PayrollManager = await ethers.getContractAt('PayrollManager', PAYROLL_MANAGER_ADDRESS);

  // Check if deployer has admin role
  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ADMIN_ROLE'));
  const hasAdminRole = await PayrollManager.hasRole(ADMIN_ROLE, deployer.address);
  
  if (!hasAdminRole) {
    console.log('❌ Deployer does not have ADMIN_ROLE');
    return;
  }

  console.log('✅ Deployer has ADMIN_ROLE\n');

  // Add employees
  console.log('📝 Adding employees to contract...');
  for (const employee of employees) {
    try {
      // Check if employee already exists
      const existingEmployee = await PayrollManager.employees(employee.address);
      if (existingEmployee.active) {
        console.log(`⏭️  Employee ${employee.name} already exists, skipping...`);
        continue;
      }

      const tx = await PayrollManager.addEmployee(employee.address, employee.arkivHash);
      await tx.wait();
      console.log(`✅ Added employee: ${employee.name} (${employee.address})`);
    } catch (error: any) {
      console.error(`❌ Error adding employee ${employee.name}:`, error.message);
    }
  }

  console.log('\n📄 Creating invoices...');
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    try {
      // Check current nextInvoiceId to avoid duplicates
      const nextId = await PayrollManager.nextInvoiceId();
      
      const tx = await PayrollManager.createInvoice(
        invoice.employeeAddress,
        invoice.amount,
        USDC_ADDRESS,
        invoice.arkivHash,
        534351 // Scroll Sepolia chain ID
      );
      const receipt = await tx.wait();
      
      console.log(`✅ Created invoice #${nextId}: ${invoice.description} - ${ethers.formatUnits(invoice.amount, 6)} USDC`);
    } catch (error: any) {
      console.error(`❌ Error creating invoice ${invoice.description}:`, error.message);
    }
  }

  // Mark the last invoice as paid (matching Arkiv data)
  console.log('\n💰 Marking last invoice as paid...');
  try {
    const PAYROLL_EXECUTOR = ethers.keccak256(ethers.toUtf8Bytes('PAYROLL_EXECUTOR'));
    const hasExecutorRole = await PayrollManager.hasRole(PAYROLL_EXECUTOR, deployer.address);
    
    if (hasExecutorRole) {
      const lastInvoiceId = await PayrollManager.nextInvoiceId();
      const invoiceIdToPay = lastInvoiceId - 1n; // Last created invoice
      
      // Check if already paid
      const invoice = await PayrollManager.invoices(invoiceIdToPay);
      if (!invoice.paid) {
        const tx = await PayrollManager.markInvoicePaid(invoiceIdToPay);
        await tx.wait();
        console.log(`✅ Marked invoice #${invoiceIdToPay} as paid`);
      } else {
        console.log(`⏭️  Invoice #${invoiceIdToPay} already paid`);
      }
    } else {
      console.log('⏭️  Deployer does not have PAYROLL_EXECUTOR role, skipping payment marking');
    }
  } catch (error: any) {
    console.error('❌ Error marking invoice as paid:', error.message);
  }

  // Display summary
  console.log('\n📊 Contract Summary:');
  const tally = await PayrollManager.getInvoiceTally();
  console.log(`Total Invoices: ${tally[0]}`);
  console.log(`Paid Invoices: ${tally[1]}`);
  console.log(`Total Amount Paid: ${ethers.formatUnits(tally[2], 6)} USDC`);

  console.log('\n✨ Contract seeding completed!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
