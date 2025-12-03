'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { setAuthToken } from '@/lib/auth-client';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    practice_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        setError('Invalid response from server');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError('No token received');
        setLoading(false);
        return;
      }

      setAuthToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-display text-center text-step-primary-500">Stepladder</h1>
          <h2 className="mt-6 text-center text-heading-lg">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-step-status-danger-bg dark:bg-red-900/30 border border-step-status-danger-text/20 dark:border-red-500/30 text-step-status-danger-text dark:text-red-400 px-4 py-3 rounded-lg transition-colors duration-200">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="new-password"
              minLength={8}
            />
            <Input
              label="Practice Name (optional)"
              type="text"
              value={formData.practice_name}
              onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
            />
          </div>
          <div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-step-primary-600 hover:text-step-primary-500 text-body-sm transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

