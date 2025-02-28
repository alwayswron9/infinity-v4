'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, DatabaseIcon, SettingsIcon, LogOutIcon } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/models', label: 'Models', icon: DatabaseIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', { 
        method: 'GET',
        credentials: 'same-origin'
      });

      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Force reload to clear any cached state
      window.location.replace('/');
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.replace('/');
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 bg-surface border-r border-border flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-primary">Infinity</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-surface">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
        >
          <LogOutIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
} 