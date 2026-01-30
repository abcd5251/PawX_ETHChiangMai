'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type WalletInfo = {
  userId: string;
  evmAddress: string;
  solAddress: string;
};

export default function TelegramWalletLogin() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [selectedChain, setSelectedChain] = useState<'BSC' | 'SOLANA'>('BSC');
  const [isLoading, setIsLoading] = useState(false);
  const hasAutoLogin = useRef(false);
  const botUrl = 'https://t.me/pawx_trading_bot?start=login';
  const formatAddress = (address?: string) => {
    if (!address) {
      return '尚未登入';
    }
    if (address.length <= 12) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const performLogin = useCallback(async (payload: Record<string, any>) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tg-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || '登入失敗');
      }
      const data = await response.json();
      setWalletInfo({
        userId: String(data.id || payload.id || payload.user_id),
        evmAddress: data.evmAddress,
        solAddress: data.solAddress,
      });
      toast({
        title: '登入成功',
        description: '已建立 BSC 與 Solana 錢包',
      });
    } catch (error: any) {
      toast({
        title: '登入失敗',
        description: error?.message || '未知錯誤',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (hasAutoLogin.current) {
      return;
    }
    const params = Object.fromEntries(searchParams.entries());
    if (!params.user_id && !params.id) {
      return;
    }
    hasAutoLogin.current = true;
    performLogin(params);
    router.replace('/sniper');
  }, [performLogin, router, searchParams]);

  const addressToShow = selectedChain === 'BSC'
    ? walletInfo?.evmAddress
    : walletInfo?.solAddress;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white/90 p-5 shadow-sm dark:border-gray-600 dark:bg-gray-700/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedChain}
            onValueChange={value => setSelectedChain(value as 'BSC' | 'SOLANA')}
          >
            <SelectTrigger className="h-9 w-[180px]">
              <SelectValue placeholder="選擇 Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BSC">BSC</SelectItem>
              <SelectItem value="SOLANA">Solana</SelectItem>
            </SelectContent>
          </Select>
          {!walletInfo && (
            <Button
              className="h-9"
              onClick={() => {
                window.open(botUrl, '_blank');
              }}
              disabled={isLoading}
            >
              Telegram Login
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800/60">
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-600 dark:text-gray-100">
            {selectedChain}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-100">
            {formatAddress(addressToShow)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            disabled={!walletInfo || isLoading}
            onClick={() => {
              const address = addressToShow;
              if (!address) {
                return;
              }
              navigator.clipboard.writeText(address);
              toast({
                title: '已複製',
                description: address,
              });
            }}
          >
            複製
          </Button>
        </div>
      </div>
    </div>
  );
}
