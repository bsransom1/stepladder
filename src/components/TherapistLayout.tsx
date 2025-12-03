'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { Topbar } from './Topbar';
import { getAuthToken, removeAuthToken, getAuthHeaders } from '@/lib/auth-client';

interface TherapistLayoutProps {
  children: React.ReactNode;
  onDeleteClient?: () => void;
  deleting?: boolean;
}

// Cache therapist name across navigations
let cachedTherapistName: string | null = null;
let therapistNamePromise: Promise<string> | null = null;

export const TherapistLayout: React.FC<TherapistLayoutProps> = ({ children, onDeleteClient, deleting }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [therapistName, setTherapistName] = useState<string>(cachedTherapistName || 'User');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Only fetch once, not on every navigation
    if (!hasFetchedRef.current && !cachedTherapistName) {
      hasFetchedRef.current = true;
      fetchTherapistInfo();
    } else if (cachedTherapistName) {
      // Use cached value immediately
      setTherapistName(cachedTherapistName);
    }
  }, []); // Empty deps - only run once on mount

  const fetchTherapistInfo = async () => {
    // If there's already a fetch in progress, wait for it
    if (therapistNamePromise) {
      const name = await therapistNamePromise;
      setTherapistName(name);
      return;
    }

    // Create new fetch promise
    therapistNamePromise = (async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: getAuthHeaders(),
        });

        if (response.status === 401) {
          router.push('/login');
          return 'User';
        }

        if (response.ok) {
          const data = await response.json();
          const name = data.therapist?.name || 'User';
          cachedTherapistName = name;
          setTherapistName(name);
          return name;
        }
        return 'User';
      } catch (error) {
        console.error('Failed to fetch therapist info:', error);
        return 'User';
      } finally {
        therapistNamePromise = null;
      }
    })();

    await therapistNamePromise;
  };

  const handleLogout = () => {
    // Clear cache on logout
    cachedTherapistName = null;
    therapistNamePromise = null;
    removeAuthToken();
    router.push('/login');
  };

  // Don't block rendering - show layout immediately
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-200">
      <AppSidebar onDeleteClient={onDeleteClient} deleting={deleting} />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar onLogout={handleLogout} therapistName={therapistName} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

