'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HiHome, HiUsers, HiChartBar, HiCog } from 'react-icons/hi';

interface AppSidebarProps {
  onDeleteClient?: () => void;
  deleting?: boolean;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onDeleteClient, deleting }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HiHome },
    { href: '/clients', label: 'Clients', icon: HiUsers },
    { href: '/analytics', label: 'Analytics', icon: HiChartBar },
    { href: '/settings', label: 'Settings', icon: HiCog },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col transition-colors duration-200">
        {/* Logo row */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-2">
          <Image
            src="/sl_logo.png"
            alt="StepLadder logo"
            width={22}
            height={22}
            className="object-contain"
          />
          <h1 className="text-heading-lg font-semibold tracking-tight text-foreground">StepLadder</h1>
        </div>

        {/* Primary nav list */}
        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                  isActive
                    ? 'bg-step-primary-500/15 text-step-primary-300'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">StepLadder v1.0</p>
        </div>
      </aside>

      {/* Delete Button - Rendered via portal to document.body */}
      {mounted && onDeleteClient && typeof window !== 'undefined' && createPortal(
        <div 
          style={{ 
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 99999,
            pointerEvents: 'auto',
            margin: 0,
            padding: 0
          }}
        >
          <button
            onClick={onDeleteClient}
            disabled={deleting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: deleting ? 'rgba(185, 28, 28, 0.5)' : '#B91C1C',
              color: 'white',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.5 : 1,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'background-color 0.2s',
              margin: 0,
              display: 'block'
            }}
            onMouseEnter={(e) => {
              if (!deleting) {
                e.currentTarget.style.backgroundColor = 'rgba(185, 28, 28, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              if (!deleting) {
                e.currentTarget.style.backgroundColor = '#B91C1C';
              }
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>,
        document.body
      )}
    </>
  );
};

