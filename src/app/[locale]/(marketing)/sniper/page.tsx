'use client';

import TelegramWalletLogin from '@/components/TelegramWalletLogin';

export default function SniperPage() {
  return (
    <div className="flex min-h-[calc(100vh-84px)] w-full bg-gray-100 p-6 dark:bg-gray-500">
      <div className="w-full">
        <TelegramWalletLogin />
      </div>
    </div>
  );
}
