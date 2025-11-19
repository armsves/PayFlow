'use client';

import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import { BrowserProvider, Contract } from 'ethers';
import { useMemo } from 'react';

// PayrollManager ABI (add the necessary functions)
const PAYROLL_MANAGER_ABI = [
  'function addEmployee(address _employee, string memory _arkivProfileHash) external',
  'function createInvoice(address _employee, uint256 _amount, address _token, string memory _arkivDataHash, uint256 _chainId) external returns (uint256)',
  'function markInvoicePaid(uint256 _invoiceId) external',
  'function getEmployeeInvoices(address _employee) external view returns (uint256[])',
  'function invoices(uint256) external view returns (uint256 invoiceId, address employee, uint256 amount, address token, uint256 timestamp, bool paid, string arkivDataHash, uint256 chainId)',
  'function employees(address) external view returns (address walletAddress, string arkivProfileHash, bool active, uint256 totalPaid, uint256 invoiceCount)',
  'function hasRole(bytes32 role, address account) external view returns (bool)',
  'function ADMIN_ROLE() external view returns (bytes32)',
  'function PAYROLL_EXECUTOR() external view returns (bytes32)'
];

// CrossChainPaymentExecutor ABI
const EXECUTOR_ABI = [
  'function executeCrossChainPayment(uint256 _invoiceId, address _employee, address _token, uint256 _amount, uint256 _destinationChain, string memory _bridge) external payable',
  'function executeViaWormhole(uint256 _invoiceId, uint16 _targetChain, address _targetAddress, bytes memory _payload) external payable'
];

export function usePayrollContract() {
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');

  const contracts = useMemo(() => {
    if (!isConnected || !walletProvider) return null;

    const ethersProvider = new BrowserProvider(walletProvider as any);

    return {
      getPayrollManager: async () => {
        const signer = await ethersProvider.getSigner();
        return new Contract(
          process.env.NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS!,
          PAYROLL_MANAGER_ABI,
          signer
        );
      },
      getExecutor: async () => {
        const signer = await ethersProvider.getSigner();
        return new Contract(
          process.env.NEXT_PUBLIC_CROSS_CHAIN_EXECUTOR_ADDRESS!,
          EXECUTOR_ABI,
          signer
        );
      },
      provider: ethersProvider
    };
  }, [isConnected, walletProvider]);

  return {
    contracts,
    address,
    isConnected
  };
}

// Helper hook for admin actions
export function usePayrollAdmin() {
  const { contracts, address, isConnected } = usePayrollContract();

  const addEmployee = async (employeeAddress: string, arkivProfileHash: string) => {
    if (!contracts) throw new Error('Wallet not connected');
    const payrollManager = await contracts.getPayrollManager();
    const tx = await payrollManager.addEmployee(employeeAddress, arkivProfileHash);
    return tx.wait();
  };

  const createInvoice = async (
    employeeAddress: string,
    amount: bigint,
    token: string,
    arkivDataHash: string,
    chainId: number
  ) => {
    if (!contracts) throw new Error('Wallet not connected');
    const payrollManager = await contracts.getPayrollManager();
    const tx = await payrollManager.createInvoice(
      employeeAddress,
      amount,
      token,
      arkivDataHash,
      chainId
    );
    const receipt = await tx.wait();
    return receipt;
  };

  const checkIsAdmin = async () => {
    if (!contracts || !address) return false;
    const payrollManager = await contracts.getPayrollManager();
    const adminRole = await payrollManager.ADMIN_ROLE();
    return await payrollManager.hasRole(adminRole, address);
  };

  return {
    addEmployee,
    createInvoice,
    checkIsAdmin,
    isConnected
  };
}
