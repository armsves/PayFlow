import { useState, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { PayrollContract } from '@/lib/contracts';

export function usePayroll() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const address = user?.wallet?.address;
  const isConnected = authenticated && !!address;

  const getContract = useCallback(async () => {
    if (!isConnected || wallets.length === 0) {
      throw new Error('Wallet not connected');
    }

    try {
      const wallet = wallets[0];
      await wallet.switchChain(534351);
      const ethereumProvider = await wallet.getEthereumProvider();
      
      // Create provider without ENS support (Scroll Sepolia doesn't support ENS)
      const provider = new BrowserProvider(ethereumProvider, {
        chainId: 534351,
        name: 'scroll-sepolia',
        ensAddress: null as any, // Disable ENS
      });
      
      const signer = await provider.getSigner();
      return new PayrollContract(signer);
    } catch (err: any) {
      // If there's a network error, throw a more specific error
      if (err.message?.includes('chainId') || err.message?.includes('network')) {
        throw new Error('Unable to determine current chainId. Please ensure you are connected to Scroll Sepolia network.');
      }
      throw err;
    }
  }, [isConnected, wallets]);

  const addEmployee = async (employeeAddress: string, arkivProfileHash: string) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const receipt = await contract.addEmployee(employeeAddress, arkivProfileHash);
      return receipt;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (
    employeeAddress: string,
    amount: string,
    tokenAddress: string,
    arkivDataHash: string,
    chainId: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const amountWei = BigInt(amount);
      const receipt = await contract.createInvoice(
        employeeAddress,
        amountWei,
        tokenAddress,
        arkivDataHash,
        chainId
      );
      return receipt;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markInvoicePaid = async (invoiceId: string) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const receipt = await contract.markInvoicePaid(BigInt(invoiceId));
      return receipt;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEmployee = async (employeeAddress: string) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const employee = await contract.getEmployee(employeeAddress);
      return employee;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceTally = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const tally = await contract.getInvoiceTally();
      return tally;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = async () => {
    if (!isConnected || !address) return false;
    try {
      const contract = await getContract();
      return await contract.isAdmin(address);
    } catch (err) {
      return false;
    }
  };

  const updateEmployeeStatus = async (employeeAddress: string, active: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getContract();
      const receipt = await contract.updateEmployeeStatus(employeeAddress, active);
      return receipt;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    address,
    isConnected,
    loading,
    error,
    addEmployee,
    createInvoice,
    markInvoicePaid,
    getEmployee,
    getInvoiceTally,
    isAdmin,
    updateEmployeeStatus
  };
}
