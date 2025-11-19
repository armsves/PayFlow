import { ethers } from 'ethers';

export interface PaymentRoute {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  amount: string;
  employeeAddress: string;
}

export class CrossChainService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;

  constructor(provider: ethers.Provider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
  }

  async getOptimalRoute(payment: PaymentRoute): Promise<any> {
    // Integration with LiFi SDK
    const response = await fetch('https://li.quest/v1/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromChain: payment.fromChain,
        toChain: payment.toChain,
        fromToken: payment.fromToken,
        toToken: payment.toToken,
        fromAmount: payment.amount,
        fromAddress: await this.signer.getAddress(),
        toAddress: payment.employeeAddress,
      }),
    });

    return await response.json();
  }

  async executePayment(route: any): Promise<string> {
    const tx = await this.signer.sendTransaction({
      to: route.transactionRequest.to,
      data: route.transactionRequest.data,
      value: route.transactionRequest.value,
      gasLimit: route.transactionRequest.gasLimit,
    });

    const receipt = await tx.wait();
    return receipt?.hash || '';
  }
}
