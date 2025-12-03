'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { MdOutlinePersonAddAlt1 } from 'react-icons/md';
import { HiOutlineDocumentAdd, HiHome, HiUsers, HiChartBar, HiCog } from 'react-icons/hi';
import { HiPlus } from 'react-icons/hi';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  onLogout: () => void;
  onDeleteClient?: () => void;
  deleting?: boolean;   
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout, onDeleteClient, deleting }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: HiHome },
    { href: '/clients', label: 'Clients', icon: HiUsers },
    { href: '/analytics', label: 'Analytics', icon: HiChartBar },
    { href: '/settings', label: 'Settings', icon: HiCog },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      {/* Navbar container - centered independently, no relative positioning */}
      <div className="mx-4 mt-4 mb-6 max-w-4xl mx-auto">
        <nav className="bg-step-surface dark:bg-step-dark-surface border-b border-step-border dark:border-step-dark-border rounded-2xl shadow-sm transition-colors duration-200">
          <div className="flex items-center px-4 py-3">
            {/* Left section - Logo */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <h1 className="text-heading-lg font-bold text-step-text-main dark:text-step-dark-text-main">StepLadder</h1>
              <Image
                src="/sl_logo.png"
                alt="Stepladder logo"
                width={22}
                height={22}
                className="object-contain"
              />
            </div>
            
            {/* Center section - Navigation (truly centered) */}
            <div className="flex-1 flex justify-center">
              <ul className="flex items-center gap-1">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const showAddButton = item.href === '/clients';
                  return (
                    <React.Fragment key={item.href}>
                      <li>
                        <Link
                          href={item.href}
                          className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors relative ${
                            isActive
                              ? 'bg-step-primary-50 dark:bg-step-primary-900/30 text-step-primary-700 dark:text-step-primary-300 font-medium'
                              : 'text-step-text-muted dark:text-step-dark-text-muted hover:bg-step-bg dark:hover:bg-step-dark-bg'
                          }`}
                        >
                          {item.icon && <item.icon className="w-5 h-5 mb-1" />}
                          <span className="text-label">{item.label}</span>
                        </Link>
                      </li>
                      {showAddButton && (
                        <li className="relative mx-3" ref={dropdownRef}>
                          <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            aria-label="Add new item"
                            className="w-10 h-10 rounded-full bg-step-primary-600 dark:bg-step-primary-500 text-white hover:bg-step-primary-700 dark:hover:bg-step-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-step-primary-500 focus:ring-offset-2 dark:focus:ring-offset-step-dark-surface flex items-center justify-center shadow-md"
                          >
                            <HiPlus className="w-5 h-5" style={{ strokeWidth: 3 }} />
                          </button>
                          {showDropdown && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-step-surface dark:bg-step-dark-surface rounded-lg shadow-lg border border-step-border dark:border-step-dark-border py-2 z-50 transition-colors duration-200">
                              <button
                                onClick={() => {
                                  router.push('/clients/new');
                                  setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-step-bg dark:hover:bg-step-dark-bg flex items-center gap-3 transition-colors"
                              >
                                <MdOutlinePersonAddAlt1 className="w-5 h-5 text-step-text-muted dark:text-step-dark-text-muted" />
                                <span className="text-body font-medium text-step-text-main dark:text-step-dark-text-main">Add client</span>
                              </button>
                              <button
                                onClick={() => {
                                  router.push('/worksheets/new');
                                  setShowDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-step-bg dark:hover:bg-step-dark-bg flex items-center gap-3 transition-colors"
                              >
                                <HiOutlineDocumentAdd className="w-5 h-5 text-step-text-muted dark:text-step-dark-text-muted" />
                                <span className="text-body font-medium text-step-text-main dark:text-step-dark-text-main">Create homework</span>
                              </button>
                            </div>
                          )}
                        </li>
                      )}
                    </React.Fragment>
                  );
                })}
              </ul>
            </div>
            
            {/* Right section - Logout */}
            <div className="flex-shrink-0">
              <button
                onClick={onLogout}
                className="px-3 py-2 text-body-sm text-step-text-muted dark:text-step-dark-text-muted hover:bg-step-bg dark:hover:bg-step-dark-bg rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
      </div>
      {/* Theme Toggle - Fixed position, right side, vertically aligned with navbar */}
      {mounted && typeof window !== 'undefined' && createPortal(
        <div 
          className="theme-toggle-fixed flex items-center"
          style={{ 
            top: '1.75rem',
            left: 'calc(50vw + min(32rem, calc((100vw - 2rem) / 2)) + 1rem)',
            right: 'auto',
            bottom: 'auto',
            zIndex: 1000,
            height: '3rem',
            width: 'auto',
            margin: 0,
            padding: 0,
            pointerEvents: 'auto',
            isolation: 'isolate',
          } as React.CSSProperties}
        >
          <ThemeToggle />
        </div>,
        document.body
      )}
      {/* Delete Button - Rendered via portal to document.body with pure inline styles */}
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

