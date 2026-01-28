'use client';

import { MonitorColumnMultiUser } from '@/components/monitor/MonitorColumnMultiUser';
import { TradingPanel } from '@/components/trading/TradingPanel';
import { useMonitorColumnsStore } from '@/store/monitorColumnsStore';
import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function SniperPage() {
  const { columns, addColumn } = useMonitorColumnsStore();

  // Initialize with a 'Sniper Monitor' column if it doesn't exist
  useEffect(() => {
    const hasSniperColumn = columns.some(col => col.name === 'Sniper Monitor');
    if (!hasSniperColumn) {
      addColumn({
        id: uuidv4(),
        name: 'Sniper Monitor',
        usernames: [],
      });
    }
  }, [columns, addColumn]);

  // Get the 'Sniper Monitor' column or create a default one
  const sniperColumn = columns.find(col => col.name === 'Sniper Monitor') || {
    id: 'default',
    name: 'Sniper Monitor',
    usernames: [],
  };

  return (
    <div className="flex flex-row h-[calc(100vh-84px)] w-full bg-gray-100 dark:bg-gray-500">
      {/* Left side: Monitor Column (50%) */}
      <div className="w-1/2 h-full border-r border-gray-300 dark:border-gray-600">
        <MonitorColumnMultiUser
          columnId={sniperColumn.id}
          columnName={sniperColumn.name}
          usernames={sniperColumn.usernames}
        />
      </div>

      {/* Right side: Trading Panel (50%) */}
      <div className="w-1/2 h-full">
        <TradingPanel />
      </div>
    </div>
  );
}
