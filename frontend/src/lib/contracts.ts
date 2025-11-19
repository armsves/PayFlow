import { ethers } from 'ethers';

export const PAYROLL_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS!;
export const CROSS_CHAIN_EXECUTOR_ADDRESS = process.env.NEXT_PUBLIC_CROSS_CHAIN_EXECUTOR_ADDRESS!;

export const PAYROLL_MANAGER_ABI = [
  "function addEmployee(address _employee, string memory _arkivProfileHash) external",
  "function createInvoice(address _employee, uint256 _amount, address _token, string memory _arkivDataHash, uint256 _chainId) external returns (uint256)",
  "function markInvoicePaid(uint256 _invoiceId) external",
  "function getEmployeeInvoices(address _employee) external view returns (uint256[])",
  "function getInvoiceTally() external view returns (uint256 totalInvoices, uint256 paidInvoices, uint256 totalPaid)",
  "function updateEmployeeStatus(address _employee, bool _active) external",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function grantRole(bytes32 role, address account) external",
  "function employees(address) external view returns (address walletAddress, string arkivProfileHash, bool active, uint256 totalPaid, uint256 invoiceCount)",
  "function invoices(uint256) external view returns (uint256 invoiceId, address employee, uint256 amount, address token, uint256 timestamp, bool paid, string arkivDataHash, uint256 chainId)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "function PAYROLL_EXECUTOR() external view returns (bytes32)"
];

export const CROSS_CHAIN_EXECUTOR_ABI = [
  "function executeCrossChainPayment(uint256 _invoiceId, address _employee, address _token, uint256 _amount, uint256 _destinationChain, string memory _bridge) external payable",
  "function executeViaWormhole(uint256 _invoiceId, uint16 _targetChain, address _targetAddress, bytes memory _payload) external payable"
];

export interface Employee {
  walletAddress: string;
  arkivProfileHash: string;
  active: boolean;
  totalPaid: bigint;
  invoiceCount: bigint;
}

export interface Invoice {
  invoiceId: bigint;
  employee: string;
  amount: bigint;
  token: string;
  timestamp: bigint;
  paid: boolean;
  arkivDataHash: string;
  chainId: bigint;
}

export class PayrollContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(signer: ethers.Signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(PAYROLL_MANAGER_ADDRESS, PAYROLL_MANAGER_ABI, signer);
  }

  async addEmployee(employeeAddress: string, arkivProfileHash: string) {
    const tx = await this.contract.addEmployee(employeeAddress, arkivProfileHash);
    return await tx.wait();
  }

  async createInvoice(
    employeeAddress: string,
    amount: bigint,
    tokenAddress: string,
    arkivDataHash: string,
    chainId: number
  ) {
    const tx = await this.contract.createInvoice(
      employeeAddress,
      amount,
      tokenAddress,
      arkivDataHash,
      chainId
    );
    const receipt = await tx.wait();
    return receipt;
  }

  async markInvoicePaid(invoiceId: bigint) {
    const tx = await this.contract.markInvoicePaid(invoiceId);
    return await tx.wait();
  }

  async getEmployee(address: string): Promise<Employee> {
    const employee = await this.contract.employees(address);
    return {
      walletAddress: employee.walletAddress,
      arkivProfileHash: employee.arkivProfileHash,
      active: employee.active,
      totalPaid: employee.totalPaid,
      invoiceCount: employee.invoiceCount
    };
  }

  async getInvoice(invoiceId: bigint): Promise<Invoice> {
    const invoice = await this.contract.invoices(invoiceId);
    return {
      invoiceId: invoice.invoiceId,
      employee: invoice.employee,
      amount: invoice.amount,
      token: invoice.token,
      timestamp: invoice.timestamp,
      paid: invoice.paid,
      arkivDataHash: invoice.arkivDataHash,
      chainId: invoice.chainId
    };
  }

  async getEmployeeInvoices(address: string): Promise<bigint[]> {
    return await this.contract.getEmployeeInvoices(address);
  }

  async getInvoiceTally() {
    const [totalInvoices, paidInvoices, totalPaid] = await this.contract.getInvoiceTally();
    return {
      totalInvoices,
      paidInvoices,
      totalPaid
    };
  }

  async hasRole(role: string, address: string): Promise<boolean> {
    return await this.contract.hasRole(role, address);
  }

  async isAdmin(address: string): Promise<boolean> {
    const adminRole = await this.contract.ADMIN_ROLE();
    return await this.contract.hasRole(adminRole, address);
  }

  async updateEmployeeStatus(employeeAddress: string, active: boolean) {
    const tx = await this.contract.updateEmployeeStatus(employeeAddress, active);
    return await tx.wait();
  }

  async grantRole(role: string, address: string) {
    const tx = await this.contract.grantRole(role, address);
    return await tx.wait();
  }
}
