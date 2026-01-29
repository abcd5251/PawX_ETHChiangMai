'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="flex flex-col gap-4 rounded-md border border-gray-300 p-4">
      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">Telegram Login</div>
        <Button
          onClick={() => {
            window.open(botUrl, '_blank');
          }}
          disabled={isLoading}
        >
          Telegram Login
        </Button>
        <div className="text-sm text-muted-foreground">
          登入後回到此頁即可顯示錢包地址
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold">錢包顯示</div>
        <Select
          value={selectedChain}
          onValueChange={value => setSelectedChain(value as 'BSC' | 'SOLANA')}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="選擇 Chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BSC">BSC</SelectItem>
            <SelectItem value="SOLANA">Solana</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="尚未登入"
          value={addressToShow || ''}
          readOnly
        />
        <Button
          variant="ghost"
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
          複製地址
        </Button>
      </div>
    </div>
  );
}
