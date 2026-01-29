'use client';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { isAddress, parseEther } from 'viem';

const TransferNative: FC = () => {
  const { primaryWallet } = useDynamicContext();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>('');
  const [receiver, setReceiver] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(event.target.value);
  };

  const handleReceiverChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setReceiver(event.target.value);
  };

  const handleTransfer = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      toast({
        title: 'Error:',
        description: 'Please connect an Ethereum wallet first.',
      });
      return;
    }

    if (receiver.length === 0 || !isAddress(receiver)) {
      toast({
        title: 'Error:',
        description: 'The receiver address is not set or invalid!',
      });
      return;
    }

    if (Number.parseFloat(amount) <= 0) {
      toast({
        title: 'Error:',
        description: 'The amount to send must be greater than 0.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const client = await primaryWallet.getWalletClient();
      const hash = await client.sendTransaction({
        to: receiver,
        value: parseEther(amount),
      });

      toast({
        title: 'Transfer successfully sent!',
        description: `Hash: ${hash}`,
      });
      setAmount('0');
      setReceiver('');
    } catch (error: any) {
      toast({
        title: 'An error occurred:',
        description: error.message || 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-[45%] min-w-[270px] flex-col gap-2 rounded-md border border-gray-300 p-4">
      Transfer Native Token
      <Input placeholder="address" value={receiver} onChange={handleReceiverChange} />
      <Input
        placeholder="amount"
        type="number"
        value={amount}
        onChange={handleAmountChange}
      >
      </Input>

      <Button
        variant="ghost"
        onClick={handleTransfer}
        disabled={isLoading}
      >
        {isLoading
          ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading...
              </>
            )
          : (
              'Transfer'
            )}
      </Button>
    </div>
  );
};

export default TransferNative;
