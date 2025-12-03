'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TherapistLayout } from '@/components/TherapistLayout';
import { RecentHomeworkTable } from '@/components/RecentHomeworkTable';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getAuthHeaders } from '@/lib/auth-client';
import { computeAttentionItems, computeActiveHomework, AttentionItem, ActiveHomeworkItem } from '@/lib/dashboard-helpers';
import { WORKSHEET_DEFINITIONS } from '@/config/worksheetDefinitions';
import { Client, Assignment } from '@/types';

// Mock data - replace with real API calls later
const mockRecentHomework = [
  {
    clientInitials: 'John Doe',
    type: 'Exposure Log',
    worksheetType: 'erp_exposure_run',
    date: 'Nov 28 · 7:12 PM',
    keyMetric: 'SUDS 80 → 55',
    status: 'on-track' as const,
  },
  {
    clientInitials: 'Sarah Miller',
    type: 'Thought Record Worksheet',
    worksheetType: 'cbt_thought_record',
    date: 'Nov 28 · 6:45 PM',
    keyMetric: 'Belief 90 → 60',
    status: 'needs-attention' as const,
  },
  {
    clientInitials: 'Robert Kim',
    type: 'DBT Diary Card',
    worksheetType: 'dbt_diary_card',
    date: 'Nov 28 · 5:30 PM',
    keyMetric: 'Urge self-harm: 4/5',
    status: 'high-risk' as const,
  },
  {
    clientInitials: 'John Doe',
    type: 'Exposure Log',
    worksheetType: 'erp_exposure_run',
    date: 'Nov 28 · 2:15 PM',
    keyMetric: 'SUDS 70 → 50',
    status: 'on-track' as const,
  },
  {
    clientInitials: 'Alex Brown',
    type: 'Sleep Diary',
    worksheetType: 'sleep_diary',
    date: 'Nov 28 · 1:00 PM',
    keyMetric: 'Sleep efficiency: 82%',
    status: 'on-track' as const,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [activeHomework, setActiveHomework] = useState<ActiveHomeworkItem[]>([]);

  useEffect(() => {
    // Verify auth on mount
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch clients with metrics
      const clientsResponse = await fetch('/api/clients?status=active', {
        headers: getAuthHeaders(),
      });

      if (clientsResponse.status === 401) {
        router.push('/login');
        return;
      }

      if (!clientsResponse.ok) {
        console.error('Failed to fetch clients');
        setLoading(false);
        return;
      }

      const clients = await clientsResponse.json();
      
      // Compute attention items
      const attention = computeAttentionItems(clients);
      setAttentionItems(attention);

      // Fetch assignments for active homework
      // TODO: Create an API endpoint to fetch all active assignments across clients
      // For now, we'll use mock data
      const mockActiveHomework: ActiveHomeworkItem[] = [
        {
          clientId: '1',
          clientName: 'John Doe',
          assignmentId: '1',
          worksheetType: 'erp_exposure_run',
          worksheetTitle: WORKSHEET_DEFINITIONS.erp_exposure_run.title,
          modality: 'ERP',
          status: 'On track',
          lastEntry: '2 hours ago',
        },
        {
          clientId: '2',
          clientName: 'Sarah Miller',
          assignmentId: '2',
          worksheetType: 'cbt_thought_record',
          worksheetTitle: WORKSHEET_DEFINITIONS.cbt_thought_record.title,
          modality: 'CBT',
          status: 'Low completion',
          lastEntry: '3 days ago',
        },
        {
          clientId: '3',
          clientName: 'Robert Kim',
          assignmentId: '3',
          worksheetType: 'dbt_diary_card',
          worksheetTitle: WORKSHEET_DEFINITIONS.dbt_diary_card.title,
          modality: 'DBT',
          status: 'High risk',
          lastEntry: '1 day ago',
        },
      ];
      setActiveHomework(mockActiveHomework);

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const statusChipStyles = {
    'Low completion': 'bg-step-status-warning-bg dark:bg-step-status-warning-bgDark text-step-status-warning-text dark:text-step-status-warning-textDark',
    'High risk': 'bg-step-status-danger-bg dark:bg-step-status-danger-bgDark text-step-status-danger-text dark:text-step-status-danger-textDark',
    'No activity': 'bg-step-border dark:bg-step-dark-border text-step-text-muted dark:text-step-dark-text-muted',
    'On track': 'bg-step-status-success-bg dark:bg-step-status-success-bgDark text-step-status-success-text dark:text-step-status-success-textDark',
    'Paused': 'bg-step-border dark:bg-step-dark-border text-step-text-muted dark:text-step-dark-text-muted',
  };

  return (
    <TherapistLayout>
      <div className="p-8">
        {/* Section 1: Needs Attention */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-heading-lg">Needs attention</h2>
          </div>
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg overflow-hidden transition-colors duration-200">
            {attentionItems.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted">No clients need urgent attention right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-step-border dark:divide-step-dark-border">
                {attentionItems.map((item) => (
                  <Link
                    key={item.clientId}
                    href={`/clients/${item.clientId}`}
                    className="block p-4 hover:bg-step-primary-50 dark:hover:bg-step-primary-900/30 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-body font-medium text-step-text-main dark:text-step-dark-text-main mb-1">{item.displayName}</div>
                        <div className="text-body-sm text-muted">{item.reason}</div>
                      </div>
                      <span className={`ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-label font-medium ${statusChipStyles[item.status]}`}>
                        {item.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Active Homework */}
        <div className="mb-8">
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-step-border dark:border-step-dark-border">
              <h3 className="text-heading-lg">Active homework</h3>
            </div>
            {activeHomework.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-body-sm text-muted">No active homework assignments.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-step-border dark:divide-step-dark-border">
                  <thead className="bg-step-bg dark:bg-step-dark-bg">
                    <tr>
                      <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                        Worksheet
                      </th>
                      <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                        Modality
                      </th>
                      <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                        Last entry
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-step-surface dark:bg-step-dark-surface divide-y divide-step-border dark:divide-step-dark-border">
                    {activeHomework.map((item) => (
                      <tr
                        key={item.assignmentId}
                        className="hover:bg-step-primary-50 dark:hover:bg-step-primary-900/30 cursor-pointer transition-colors duration-200"
                        onClick={() => router.push(`/clients/${item.clientId}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-body-sm font-medium text-step-text-main dark:text-step-dark-text-main">{item.clientName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-body-sm text-step-text-main dark:text-step-dark-text-main">{item.worksheetTitle}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-body-sm text-muted">{item.modality}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label font-medium ${statusChipStyles[item.status]}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-body-sm text-muted">{item.lastEntry || 'No entries yet'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Recent Homework */}
        <div>
          <RecentHomeworkTable entries={mockRecentHomework.slice(0, 10)} />
        </div>
      </div>
    </TherapistLayout>
  );
}

