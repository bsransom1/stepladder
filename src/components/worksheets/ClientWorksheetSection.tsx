'use client';

import React, { useState } from 'react';
import { WorksheetCard } from './WorksheetCard';
import { WorksheetAnalyticsPanel } from './WorksheetAnalyticsPanel';
import { WORKSHEET_DEFINITIONS, WorksheetType } from '@/config/worksheetDefinitions';
import { Assignment, Client } from '@/types';
import { Button } from '../Button';
import { Input } from '../Input';
import { getAuthHeaders } from '@/lib/auth-client';
import { EmailWorksheetDialog } from '../EmailWorksheetDialog';
import { ToastContainer, ToastType } from '../Toast';
import { HiMail } from 'react-icons/hi';

interface ClientWorksheetSectionProps {
  clientId: string;
  client?: Client;
  worksheetType: WorksheetType;
  definition: typeof WORKSHEET_DEFINITIONS[WorksheetType];
  assignments: Assignment[];
  items?: any[];
  metrics: Record<string, any>;
  entries: any[];
  onRefresh: () => void;
  renderItem?: (item: any, index: number) => React.ReactNode;
  renderChart?: (entries: any[], chartTitle?: string) => React.ReactNode;
  renderTable?: (entries: any[], tableTitle?: string) => React.ReactNode;
}

export const ClientWorksheetSection: React.FC<ClientWorksheetSectionProps> = ({
  clientId,
  client,
  worksheetType,
  definition,
  assignments,
  items = [],
  metrics,
  entries,
  onRefresh,
  renderItem,
  renderChart,
  renderTable,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    label: '',
    baseline_suds: 50,
    category: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  // Handle adding items (currently only for ERP hierarchy)
  const handleAddItem = async () => {
    if (worksheetType !== 'erp_exposure_hierarchy') {
      return; // Only ERP hierarchy supports adding items for now
    }

    if (!newItem.label.trim()) {
      setError('Label is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/clients/${clientId}/erp/hierarchy-items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: [newItem],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add item');
        setLoading(false);
        return;
      }

      setNewItem({ label: '', baseline_suds: 50, category: '', description: '' });
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const hasAssignments = assignments.length > 0;
  const displayItems = items || [];
  const hasEntries = entries.length > 0;
  const canEmail = client?.email && hasEntries;

  const handleEmailClick = () => {
    setShowEmailDialog(true);
  };

  const handleEmailConfirm = async () => {
    if (!client?.email) return;

    console.log('📧 Frontend: Sending email request', { clientId, worksheetType, clientEmail: client.email });
    setSendingEmail(true);
    try {
      const response = await fetch(`/api/clients/${clientId}/worksheets/${worksheetType}/email`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      console.log('📧 Frontend: Email response', { status: response.status, data });

      if (!response.ok) {
        console.error('❌ Frontend: Email send failed', data);
        addToast(data.error || 'Failed to send email', 'error');
        setShowEmailDialog(false);
        return;
      }

      console.log('✅ Frontend: Email sent successfully');
      addToast(`Worksheet emailed successfully to ${client.email}`, 'success');
      setShowEmailDialog(false);
    } catch (err) {
      console.error('❌ Frontend: Email send exception', err);
      addToast('An error occurred while sending the email', 'error');
      setShowEmailDialog(false);
    } finally {
      setSendingEmail(false);
    }
  };

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Left: Worksheet Card */}
      <WorksheetCard
        definition={definition}
        items={displayItems}
        onAddItem={worksheetType === 'erp_exposure_hierarchy' ? () => setShowAddForm(true) : undefined}
        emptyStateText={`No ${definition.itemLabel?.toLowerCase() || 'items'} yet. Use '${definition.addButtonLabel || 'Add'}' to create the first item.`}
        renderItem={renderItem}
        showAddForm={showAddForm}
        onToggleAddForm={() => setShowAddForm(!showAddForm)}
        addFormContent={
          showAddForm && worksheetType === 'erp_exposure_hierarchy' ? (
            <>
              {error && (
                <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30 text-step-status-danger-text dark:text-step-status-danger-textDark px-4 py-2 rounded mb-4 transition-colors duration-200">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Step label"
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  placeholder="e.g., Touch bathroom doorknob"
                />
                <Input
                  label="Baseline SUDS (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.baseline_suds}
                  onChange={(e) => setNewItem({ ...newItem, baseline_suds: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={handleAddItem} disabled={loading}>
                  {loading ? 'Adding...' : definition.addButtonLabel || 'Add'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </>
          ) : undefined
        }
      />

      {/* Right: Analytics Panel */}
      {hasAssignments ? (
        <div>
          <WorksheetAnalyticsPanel
            definition={definition}
            metrics={metrics}
            entries={entries}
            renderChart={renderChart}
            renderTable={renderTable}
          />
          
          {/* Email to Client Button - Show when there are completed entries */}
          {canEmail && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleEmailClick}
                className="w-full"
              >
                <HiMail className="w-4 h-4 mr-2" />
                Email to Client
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg md:text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
            {definition.analytics?.kpiTitle || 'Analytics'}
          </h3>
          <p className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted">
            No assignments for this worksheet yet.
          </p>
        </div>
      )}
      </div>

      {/* Email Dialog */}
      {client && (
        <EmailWorksheetDialog
          isOpen={showEmailDialog}
          clientName={client.display_name}
          clientEmail={client.email || ''}
          worksheetTitle={definition.title}
          onConfirm={handleEmailConfirm}
          onCancel={() => setShowEmailDialog(false)}
          loading={sendingEmail}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

