'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/auth-client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // User is authenticated, redirect to dashboard
      setIsAuthenticated(true);
      router.push('/dashboard');
    } else {
      // User is not authenticated, show landing page
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [router]);

  // Show loading spinner only while checking auth and redirecting authenticated users
  if (loading && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return <LandingPage />;
}

