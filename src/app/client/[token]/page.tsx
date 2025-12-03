'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ClientHomeData } from '@/types';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function ClientPortalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [data, setData] = useState<ClientHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHomeData();
  }, [token]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(`/api/public/client/${token}/home`);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid or expired link');
        } else {
          setError('Failed to load data');
        }
        setLoading(false);
        return;
      }
      const homeData = await response.json();
      setData(homeData);
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-step-bg flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-step-bg flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-step-status-danger-text mb-4">{error || 'Failed to load'}</p>
          <p className="text-sm md:text-[15px] text-step-text-muted">Please contact your therapist for a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-step-bg pb-8">
      <div className="bg-step-surface border-b border-step-border px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-step-text-main tracking-tight">Stepladder</h1>
        <p className="text-sm md:text-[15px] text-step-text-muted mt-1">Hi {data.client.display_name}, here's your plan for today.</p>
      </div>

      <div className="px-4 py-6 space-y-6">
        {data.tasks.length === 0 ? (
          <div className="bg-step-surface rounded-lg border border-step-border p-6 text-center">
            <p className="text-sm md:text-[15px] text-step-text-muted">No tasks assigned for today. Great job!</p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-step-text-main mb-4">Today's Exposures</h2>
              <div className="space-y-4">
                {data.tasks.map((task) => (
                  <div
                    key={task.assignment_id}
                    className="bg-step-surface rounded-lg border border-step-border p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-base font-semibold text-step-text-main">{task.label}</h3>
                      <span className="px-3 py-1 bg-step-primary-50 text-step-primary-700 rounded-full text-xs md:text-sm font-medium">
                        {task.remaining_runs_today} of {task.total_runs_today} left
                      </span>
                    </div>
                    {task.instructions && (
                      <p className="text-sm md:text-[15px] text-step-text-muted mb-4">{task.instructions}</p>
                    )}
                    <Link
                      href={`/client/${token}/log-exposure?assignment_id=${task.assignment_id}`}
                      className="block w-full px-6 py-3 bg-step-primary-600 text-white rounded-lg text-center font-medium hover:bg-step-primary-700 transition-colors"
                    >
                      Log Exposure
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {data.progress_snippet && (
              <div className="bg-step-surface rounded-lg border border-step-border p-6">
                <h3 className="text-xs md:text-sm font-medium text-step-text-muted mb-2">This Week</h3>
                <p className="text-lg md:text-xl font-semibold text-step-text-main">
                  {data.progress_snippet.exposures_completed_last_7_days} exposures completed
                </p>
                {data.progress_snippet.avg_suds_drop_last_7_days > 0 && (
                  <p className="text-sm md:text-[15px] text-step-text-muted mt-1">
                    Average anxiety dropped by {data.progress_snippet.avg_suds_drop_last_7_days} points
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

