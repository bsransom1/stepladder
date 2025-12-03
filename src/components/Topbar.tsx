'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HiSearch, HiPlus, HiChevronDown } from 'react-icons/hi';
import { MdOutlinePersonAddAlt1 } from 'react-icons/md';
import { HiOutlineDocumentAdd } from 'react-icons/hi';
import { ThemeToggle } from './ThemeToggle';

interface TopbarProps {
  onLogout: () => void;
  therapistName?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onLogout, therapistName = 'User' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const newDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (newDropdownRef.current && !newDropdownRef.current.contains(event.target as Node)) {
        setShowNewDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get page title based on route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname?.startsWith('/clients')) return 'Clients';
    if (pathname?.startsWith('/worksheets')) return 'Create Worksheet';
    if (pathname === '/analytics') return 'Analytics';
    if (pathname === '/settings') return 'Settings';
    return 'Dashboard';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNewClick = () => {
    setShowNewDropdown(!showNewDropdown);
  };

  const handleNewAction = (action: 'client' | 'worksheet') => {
    setShowNewDropdown(false);
    if (action === 'client') {
      router.push('/clients/new');
    } else {
      router.push('/worksheets/new');
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 gap-4 bg-card/80 backdrop-blur border-b border-border transition-colors duration-200">
      {/* Left section - Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </h1>
        {pathname === '/dashboard' && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            Today
          </span>
        )}
      </div>

      {/* Center section - Search */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted border border-border text-sm max-w-md w-full">
        <HiSearch className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search clients, worksheets, notes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
        />
        <span className="text-[10px] text-muted-foreground">⌘K</span>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-3">
        {/* New button with dropdown */}
        <div className="relative" ref={newDropdownRef}>
          <button
            onClick={handleNewClick}
            className="px-3 py-2 rounded-xl bg-step-primary-500 text-white text-sm font-medium flex items-center gap-2 hover:bg-step-primary-600 transition-colors"
          >
            <HiPlus className="w-4 h-4" />
            <span>New</span>
          </button>
          {showNewDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50 transition-colors duration-200">
              <button
                onClick={() => handleNewAction('client')}
                className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors text-foreground"
              >
                <MdOutlinePersonAddAlt1 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Add client</span>
              </button>
              <button
                onClick={() => handleNewAction('worksheet')}
                className="w-full px-4 py-3 text-left hover:bg-muted flex items-center gap-3 transition-colors text-foreground"
              >
                <HiOutlineDocumentAdd className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm font-medium">Create homework</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User profile dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2 rounded-full border border-border px-2 py-1 hover:bg-muted transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-step-primary-500 flex items-center justify-center text-xs font-medium text-white">
              {getInitials(therapistName)}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">{therapistName}</span>
            <HiChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-2 z-50 transition-colors duration-200">
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-foreground text-sm"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  router.push('/settings');
                }}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-foreground text-sm"
              >
                Settings
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  onLogout();
                }}
                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors text-foreground text-sm text-red-400"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

