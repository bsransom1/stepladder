'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TherapistLayout } from '@/components/TherapistLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Select } from '@/components/Select';
import { getAuthHeaders } from '@/lib/auth-client';
import React from 'react';
import { ERPHierarchyItem, Assignment, ERPExposureRun } from '@/types';
import Link from 'next/link';
import { ClientWorksheetSection } from '@/components/worksheets/ClientWorksheetSection';
import { WORKSHEET_DEFINITIONS, WorksheetType } from '@/config/worksheetDefinitions';
import {
  getActiveWorksheetTypes,
  getAssignmentsForWorksheetType,
  computeMetricsForWorksheetType,
  getItemsForWorksheetType,
  getEntriesForWorksheetType,
} from '@/lib/worksheet-helpers';
import { getAssignmentsByClient, createAssignment } from '@/data/worksheet-assignments';
import { getWorksheetById } from '@/data/worksheets';
import { ConfigureWorksheetDialog } from '@/components/ConfigureWorksheetDialog';
import type { WorksheetAssignment } from '@/lib/types/worksheet-assignment';

// ERP-specific render functions
const renderHierarchyItem = (item: ERPHierarchyItem, index: number) => (
  <div key={item.id} className="border border-step-border dark:border-step-dark-border rounded-lg p-4 bg-step-bg dark:bg-step-dark-bg transition-colors duration-200">
    <div className="flex items-start gap-3">
      <span className="text-heading-md font-semibold text-step-text-muted dark:text-step-dark-text-muted min-w-[2rem]">
        {index + 1}.
      </span>
      <div className="flex-1">
        <h4 className="text-heading-md font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">{item.label}</h4>
        <div className="text-body-sm text-muted mb-1">
          <span className="font-medium">Baseline SUDS:</span> {item.baseline_suds}
        </div>
        {item.category && (
          <div className="text-body-sm text-muted mb-1">
            <span className="font-medium">Category:</span> {item.category}
          </div>
        )}
        {item.description && (
          <div className="text-body-sm text-muted mt-2 pt-2 border-t border-step-border dark:border-step-dark-border">
            {item.description}
          </div>
        )}
      </div>
    </div>
  </div>
);

const renderSudsChart = (entries: ERPExposureRun[], chartTitle?: string) => {
  const recentRuns = entries.slice(0, 10).reverse();
  const chartData = recentRuns.length > 0
    ? recentRuns.map((run, idx) => ({
        label: `${idx + 1}`,
        before: run.suds_before,
        after: run.suds_after,
      }))
    : [];

  // Fixed SUDS scale (0-100)
  const maxSuds = 100;

  if (chartData.length === 0) {
    return (
      <div>
        <h4 className="text-heading-sm font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">{chartTitle}</h4>
        <div className="h-48 bg-step-bg dark:bg-step-dark-bg border border-step-border dark:border-step-dark-border rounded-lg flex items-center justify-center transition-colors duration-200">
          <p className="text-body-sm text-muted">No entries logged yet</p>
        </div>
      </div>
    );
  }

  // Calculate average SUDS drop
  const avgDrop = chartData.length > 0
    ? Math.round(
        chartData.reduce((sum, d) => sum + (d.before - d.after), 0) / chartData.length
      )
    : 0;

  return (
    <div>
      <h4 className="text-heading-sm font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">{chartTitle}</h4>
      <div className="h-48 relative">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {chartData.map((point, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '100%' }}>
                <div
                  className="w-full bg-step-primary-400 dark:bg-step-primary-500 rounded-t transition-colors duration-200"
                  style={{ height: `${(point.before / maxSuds) * 100}%` }}
                  title={`Before: ${point.before}`}
                />
                <div
                  className="w-full bg-step-primary-600 dark:bg-step-primary-500 rounded-t transition-colors duration-200"
                  style={{ height: `${(point.after / maxSuds) * 100}%` }}
                  title={`After: ${point.after}`}
                />
              </div>
              <span className="text-xs text-step-text-muted dark:text-step-dark-text-muted mt-1">{idx + 1}</span>
            </div>
          ))}
        </div>
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-step-text-muted dark:text-step-dark-text-muted pr-2">
          <span>100</span>
          <span>50</span>
          <span>0</span>
        </div>
      </div>
      {avgDrop > 0 && (
        <p className="text-body-sm text-muted mt-3">
          Average SUDS drop: {avgDrop} points
        </p>
      )}
    </div>
  );
};

const renderExposureRunsTable = (entries: ERPExposureRun[], tableTitle?: string) => (
  <div>
    <h2 className="text-heading-lg mb-4">{tableTitle || 'Recent entries'}</h2>
    {entries.length === 0 ? (
      <p className="text-body-sm text-muted">No entries yet.</p>
    ) : (
      <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg overflow-hidden transition-colors duration-200">
        <table className="min-w-full divide-y divide-step-border dark:divide-step-dark-border">
          <thead className="bg-step-bg dark:bg-step-dark-bg">
            <tr>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">Date</th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">Step</th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">SUDS</th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">Duration</th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">Ritual?</th>
            </tr>
          </thead>
          <tbody className="bg-step-surface dark:bg-step-dark-surface divide-y divide-step-border dark:divide-step-dark-border">
            {entries.slice(0, 20).map((run: any) => (
              <tr key={run.id} className="hover:bg-step-bg dark:hover:bg-step-dark-bg transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-body-sm text-step-text-main dark:text-step-dark-text-main">
                  {new Date(run.date_time).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-sm text-step-text-main dark:text-step-dark-text-main">
                  {run.hierarchy_label || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-sm text-step-text-main dark:text-step-dark-text-main">
                  {run.suds_before} → {run.suds_after}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-body-sm text-step-text-main dark:text-step-dark-text-main">
                  {run.duration_minutes} min
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm md:text-[15px]">
                  {run.did_ritual ? (
                    <span className="text-step-status-danger-text dark:text-step-status-danger-textDark transition-colors duration-200">Yes</span>
                  ) : (
                    <span className="text-step-status-success-text dark:text-step-status-success-textDark transition-colors duration-200">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<any>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [worksheetAssignments, setWorksheetAssignments] = useState<WorksheetAssignment[]>([]);
  const [worksheetFilter, setWorksheetFilter] = useState<'assigned' | 'all'>('assigned');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [worksheetData, setWorksheetData] = useState<Record<WorksheetType, {
    items: any[];
    entries: any[];
  }>>({} as any);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (clientId) {
      fetchClientData();
    }
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      // Fetch client details
      const clientRes = await fetch(`/api/clients/${clientId}`, {
        headers: getAuthHeaders(),
      });
      if (clientRes.status === 401) {
        router.push('/login');
        return;
      }
      const clientData = await clientRes.json();
      setClient(clientData);

      // Fetch assignments (old API-based)
      const assignmentsRes = await fetch(`/api/clients/${clientId}/assignments`, {
        headers: getAuthHeaders(),
      });
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData || []);

      // Load worksheet assignments from in-memory repository
      const worksheetAssignmentsData = getAssignmentsByClient(clientId);
      setWorksheetAssignments(worksheetAssignmentsData);

      // Determine active worksheet types from assignments
      const activeTypes = getActiveWorksheetTypes(assignmentsData || []);

      // Fetch data for each active worksheet type
      const dataPromises = activeTypes.map(async (type) => {
        const items = await getItemsForWorksheetType(clientId, type, getAuthHeaders);
        const entries = await getEntriesForWorksheetType(clientId, type, getAuthHeaders);
        return { type, items, entries };
      });

      const results = await Promise.all(dataPromises);
      const worksheetDataMap: Record<WorksheetType, { items: any[]; entries: any[] }> = {} as any;
      
      results.forEach(({ type, items, entries }) => {
        worksheetDataMap[type] = { items, entries };
      });

      setWorksheetData(worksheetDataMap);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!clientId || !client) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.display_name}? This will permanently delete all associated data and cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete client:', errorData);
        alert('Failed to delete client. Please try again.');
        setDeleting(false);
        return;
      }

      // Success - redirect to clients list
      router.push('/clients');
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client. Please try again.');
      setDeleting(false);
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

  if (!client) {
    return (
      <TherapistLayout>
        <div className="p-8">
          <p>Client not found</p>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout onDeleteClient={handleDeleteClient} deleting={deleting}>
        <div className="p-8">
          {/* Header - Keep as is */}
          <div className="mb-8">
            <Link
              href="/clients"
              className="text-body-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
            >
              ← Back to Clients
            </Link>
            <div className="mb-4">
              <div>
                <h1 className="text-display">{client.display_name}</h1>
                {client.email && (
                  <p className="text-body-sm text-muted mt-1">{client.email}</p>
                )}
                <p className="text-body-sm text-muted mt-1">{client.primary_modality} · {client.status}</p>
              </div>
            </div>

          {/* Magic Link */}
          {client.magic_link && (
            <div className="bg-step-status-info-bg dark:bg-step-status-info-bgDark border border-step-status-info-text/20 dark:border-step-status-info-textDark/30 rounded-lg p-4 mb-6 transition-colors duration-200">
              <p className="text-label text-step-status-info-text dark:text-step-status-info-textDark mb-2 font-medium">Client Magic Link:</p>
              <code className="text-caption break-all bg-step-surface dark:bg-step-dark-surface p-2 rounded border border-step-border dark:border-step-dark-border block mb-2 text-step-text-main dark:text-step-dark-text-main transition-colors duration-200">
                {typeof window !== 'undefined' 
                  ? `${window.location.origin}/client/${client.magic_link.token}`
                  : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/${client.magic_link.token}`}
              </code>
              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' 
                    ? `${window.location.origin}/client/${client.magic_link.token}`
                    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/${client.magic_link.token}`;
                  navigator.clipboard.writeText(url);
                }}
                className="text-body-sm text-step-primary-700 dark:text-step-primary-400 hover:text-step-primary-600 dark:hover:text-step-primary-500 underline transition-colors duration-200"
              >
                Copy link
              </button>
            </div>
          )}
        </div>

        {/* Worksheet Assignments Section */}
        {worksheetAssignments.length > 0 && (() => {
          const filteredAssignments = worksheetAssignments.filter((assignment) => {
            if (worksheetFilter === 'all') return true;
            // "assigned" means assigned or in_progress (not completed)
            return assignment.status !== 'completed';
          });

          return (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-heading-xl">Worksheets</h2>
                <div className="flex items-center gap-2">
                  <Select
                    value={worksheetFilter}
                    onChange={(e) => setWorksheetFilter(e.target.value as 'assigned' | 'all')}
                    options={[
                      { value: 'assigned', label: 'Assigned' },
                      { value: 'all', label: 'All' },
                    ]}
                    className="w-32"
                  />
                </div>
              </div>
              {filteredAssignments.length === 0 ? (
                <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 text-center">
                  <p className="text-body-sm text-muted">
                    {worksheetFilter === 'assigned' 
                      ? 'No assigned worksheets. All worksheets are completed.'
                      : 'No worksheets found.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssignments.map((assignment) => {
                const worksheet = getWorksheetById(assignment.worksheetId);
                if (!worksheet) return null;

                const getStatusBadgeColor = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return 'bg-step-status-success-bg dark:bg-step-status-success-bgDark text-step-status-success-text dark:text-step-status-success-textDark border-step-status-success-text/20 dark:border-step-status-success-textDark/30';
                    case 'in_progress':
                      return 'bg-step-status-info-bg dark:bg-step-status-info-bgDark text-step-status-info-text dark:text-step-status-info-textDark border-step-status-info-text/20 dark:border-step-status-info-textDark/30';
                    case 'assigned':
                    default:
                      return 'bg-step-surface dark:bg-step-dark-surface text-step-text-muted dark:text-step-dark-text-muted border-step-border dark:border-step-dark-border';
                  }
                };

                const formatDate = (dateString: string) => {
                  return new Date(dateString).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                };

                return (
                  <Link
                    key={assignment.id}
                    href={`/clients/${clientId}/worksheets/${assignment.id}`}
                    className="block"
                  >
                    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-4 hover:bg-step-bg dark:hover:bg-step-dark-bg transition-all duration-200 cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-heading-md">{worksheet.title}</h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-label font-medium border transition-colors duration-200 ${getStatusBadgeColor(
                                assignment.status
                              )}`}
                            >
                              {assignment.status === 'in_progress'
                                ? 'In Progress'
                                : assignment.status === 'completed'
                                ? 'Completed'
                                : 'Assigned'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-body-sm text-muted-foreground mb-2">
                            <span>{worksheet.modality}</span>
                            {worksheet.problemDomains.length > 0 && (
                              <span>{worksheet.problemDomains.join(', ')}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-body-sm text-muted-foreground">
                            <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                            {assignment.dueDate && (
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            )}
                            {assignment.completedAt && (
                              <span>Completed: {formatDate(assignment.completedAt)}</span>
                            )}
                          </div>
                          {assignment.note && (
                            <p className="text-body-sm text-muted-foreground mt-2 pt-2 border-t border-step-border dark:border-step-dark-border">
                              {assignment.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* Determine active worksheet types from assignments */}
        {(() => {
          const activeWorksheetTypes = getActiveWorksheetTypes(assignments);
          
          // If no assignments (old or new), show neutral empty state
          if (activeWorksheetTypes.length === 0 && worksheetAssignments.length === 0) {
            return (
              <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-12 text-center transition-colors duration-200">
                <h2 className="text-heading-xl mb-2">No homework assigned yet</h2>
                <p className="text-body-sm text-muted mb-6">
                  Use 'Assign Homework' to create the first worksheet for this client.
                </p>
                <Button onClick={() => setShowAssignModal(true)}>
                  Assign Homework
                </Button>
              </div>
            );
          }

          // Render worksheet sections for each active type
          return (
            <>
              {activeWorksheetTypes.map((worksheetType) => {
                const definition = WORKSHEET_DEFINITIONS[worksheetType];
                const worksheetAssignments = getAssignmentsForWorksheetType(assignments, worksheetType);
                const data = worksheetData[worksheetType] || { items: [], entries: [] };
                const metrics = computeMetricsForWorksheetType(
                  worksheetType,
                  data.entries,
                  worksheetAssignments,
                  client.metrics
                );

                // Determine which render functions to use based on worksheet type
                let renderItem: ((item: any, index: number) => React.ReactNode) | undefined;
                let renderChart: ((entries: any[], chartTitle?: string) => React.ReactNode) | undefined;
                let renderTable: ((entries: any[], tableTitle?: string) => React.ReactNode) | undefined;

                if (worksheetType === 'erp_exposure_hierarchy') {
                  renderItem = renderHierarchyItem;
                }

                if (worksheetType === 'erp_exposure_run') {
                  renderChart = renderSudsChart;
                  renderTable = renderExposureRunsTable;
                }

                return (
                  <ClientWorksheetSection
                    key={worksheetType}
                    clientId={clientId}
                    client={client}
                    worksheetType={worksheetType}
                    definition={definition}
                    assignments={worksheetAssignments}
                    items={data.items}
                    metrics={metrics}
                    entries={data.entries}
                    onRefresh={fetchClientData}
                    renderItem={renderItem}
                    renderChart={renderChart}
                    renderTable={renderTable}
                  />
                );
              })}
            </>
          );
        })()}

        {/* Assign Worksheet Modal */}
        {showAssignModal && (
          <AssignWorksheetModal
            clientId={clientId}
            onClose={() => setShowAssignModal(false)}
            onSuccess={() => {
              // Refresh assignments after creating new one
              const updatedAssignments = getAssignmentsByClient(clientId);
              setWorksheetAssignments(updatedAssignments);
            }}
          />
        )}

        </div>
      </TherapistLayout>
  );
}

// AssignWorksheetModal component (extracted from worksheets page)
interface AssignWorksheetModalProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignWorksheetModal: React.FC<AssignWorksheetModalProps> = ({
  clientId,
  onClose,
  onSuccess,
}) => {
  const handleConfigureSave = async (config: {
    worksheetId: string;
    modality: string;
    title: string;
    clinicianConfigValues: Record<string, any>;
    dueDate?: string;
    note?: string;
  }) => {
    try {
      const assignment = createAssignment({
        clientId,
        worksheetId: config.worksheetId,
        dueDate: config.dueDate,
        note: config.note,
        clinicianConfigValues: config.clinicianConfigValues,
      });

      // Send email notification for all modalities using unified helper
      // Fetch client to get email address
      try {
        const clientRes = await fetch(`/api/clients/${clientId}`, {
          headers: getAuthHeaders(),
        });
        if (clientRes.ok) {
          const clientData = await clientRes.json();
          if (clientData.email) {
            // Fire-and-forget email sending with magic link
            fetch('/api/email/send-worksheet-assignment-for-assignments', {
              method: 'POST',
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                clientEmail: clientData.email,
                clientName: clientData.display_name || 'Client',
                assignments: [{
                  id: assignment.id,
                  worksheetId: assignment.worksheetId,
                }],
              }),
            }).catch((error) => {
              console.error('Failed to send worksheet assignment email:', error);
              // Don't show error to user - email failure shouldn't break the flow
            });
          }
        }
      } catch (emailError) {
        console.error('Failed to fetch client or send email:', emailError);
        // Don't fail the assignment creation if email fails
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      // Error handling could be improved with toast notifications
    }
  };

  return (
    <ConfigureWorksheetDialog
      showAssignmentFields={true}
      onClose={onClose}
      onSave={handleConfigureSave}
    />
  );
};

