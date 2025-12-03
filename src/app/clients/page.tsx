'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TherapistLayout } from '@/components/TherapistLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getAuthHeaders } from '@/lib/auth-client';
import { Client } from '@/types';

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const fetchClients = async () => {
    try {
      const response = await fetch(`/api/clients?status=${statusFilter}`, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch clients:', response.status, errorData);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setClients(data || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TherapistLayout>
        <div className="p-8">
          <LoadingSpinner size={48} />
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-display">Clients</h1>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 text-body-sm font-medium ${
              statusFilter === 'active'
                ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white'
                : 'bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border text-step-text-muted dark:text-step-dark-text-muted hover:bg-step-bg dark:hover:bg-step-dark-bg'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 text-body-sm font-medium ${
              statusFilter === 'archived'
                ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white'
                : 'bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border text-step-text-muted dark:text-step-dark-text-muted hover:bg-step-bg dark:hover:bg-step-dark-bg'
            }`}
          >
            Archived
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-step-text-muted dark:text-step-dark-text-muted">
              No {statusFilter} clients yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {clients.map((client: any) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="block p-6 bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg hover:bg-step-bg dark:hover:bg-step-dark-bg hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-heading-md">{client.display_name}</h3>
                    {client.email && (
                      <p className="text-body-sm text-muted mt-1">{client.email}</p>
                    )}
                    <p className="text-body-sm text-muted mt-1">
                      {client.primary_modality} · {client.status}
                    </p>
                    {client.exposures_completed_this_week !== undefined && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-label font-medium bg-step-primary-50 dark:bg-step-primary-900/30 text-step-primary-700 dark:text-step-primary-300 transition-colors duration-200">
                          {client.exposures_completed_this_week}/{client.exposures_assigned_this_week} exposures this week
                        </span>
                      </div>
                    )}
                  </div>
                  {client.last_activity_at && (
                    <span className="text-body-sm text-muted">
                      Last activity: {new Date(client.last_activity_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </TherapistLayout>
  );
}

