import { Activity, Compass, Megaphone, Target, Users } from 'lucide-react';
import Image from 'next/image';
import { NavLink } from './NavLink';
import { SearchInput } from './SearchInput';
import { StatusIndicator } from './StatusIndicator';
import { ThemeSwitcher } from './ThemeSwitcher';

export const NavBar = () => (
  <div className="sticky top-0 z-50 bg-gray-200 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800">
    <div className="mx-auto max-w-screen-lg flex items-center justify-between">
      <Image
        src="/pawx.jpg"
        alt="Foxhole Bot Logo"
        width={32}
        height={32}
      />
      <NavLink href="/" default>
        <Activity className="w-4 h-4" />
        <span className="hidden sm:inline">Profiles</span>
      </NavLink>

      <NavLink href="/discover">
        <Compass className="w-4 h-4" />
        <span className="hidden sm:inline">Discover</span>
      </NavLink>

      <NavLink href="/monitor">
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Monitor</span>
      </NavLink>

      <NavLink href="/campaigns">
        <Megaphone className="w-4 h-4" />
        <span className="hidden sm:inline">Campaigns</span>
      </NavLink>

      <NavLink href="/sniper">
        <Target className="w-4 h-4" />
        <span className="hidden sm:inline">Sniper</span>
      </NavLink>

      <div className="flex items-center gap-4">
        <SearchInput />
        <ThemeSwitcher />
        <StatusIndicator />
      </div>
    </div>
  </div>
);
