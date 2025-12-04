'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TherapistLayout } from '@/components/TherapistLayout';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { getAuthHeaders } from '@/lib/auth-client';
import { worksheetsByModality, getWorksheetById } from '@/data/worksheets';
import { createAssignment } from '@/data/worksheet-assignments';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import type { WorksheetTemplate } from '@/lib/types/worksheet';
import { Client } from '@/types';

type ModalityKey = keyof typeof worksheetsByModality; // "CBT" | "ERP" | "DBT" | "CBT-J" | "SUD"

export default function NewWorksheetPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [modality, setModality] = useState<ModalityKey>('CBT');
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients?status=active', {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        setError('Failed to fetch clients');
        setLoadingClients(false);
        return;
      }

      const data = await response.json();
      setClients(data || []);
    } catch (err) {
      setError('Failed to fetch clients');
    } finally {
      setLoadingClients(false);
    }
  };

  // Get available worksheets for the selected modality
  const availableWorksheets: WorksheetTemplate[] =
    worksheetsByModality[modality] ?? [];

  const selectedWorksheet = selectedWorksheetId
    ? getWorksheetById(selectedWorksheetId)
    : null;

  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const handleSendToPatient = async () => {
    if (!selectedClientId || !modality || !selectedWorksheetId) {
      setError('Please complete all required fields');
      return;
    }

    setSending(true);
    setError('');
    setSuccess('');

    try {
      // Create the assignment using the new in-memory repository
      createAssignment({
        clientId: selectedClientId,
        worksheetId: selectedWorksheetId,
        dueDate: dueDate || undefined,
        note: note || undefined,
      });

      // Send email notification if client has email
      if (selectedClient?.email && selectedWorksheet) {
        try {
          await fetch('/api/email/send-worksheet-assignment', {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: selectedClient.email,
              clientName: selectedClient.display_name || 'Client',
              worksheets: [{
                title: selectedWorksheet.title,
                modality: selectedWorksheet.modality,
              }],
            }),
          });
          setSuccess('Worksheet created and email sent successfully!');
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          setSuccess('Worksheet created successfully! (Email sending failed)');
        }
      } else {
        setSuccess('Worksheet created successfully!');
      }

      setSending(false);
      
      // Redirect to client overview page after a short delay
      setTimeout(() => {
        router.push(`/clients/${selectedClientId}`);
      }, 1500);
    } catch (err: any) {
      console.error('Error creating worksheet:', err);
      setError(err.message || 'An error occurred while creating the worksheet.');
      setSending(false);
    }
  };

  return (
    <TherapistLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-step-text-main tracking-tight mb-6">Create worksheet</h1>

        {error && (
          <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30 text-step-status-danger-text dark:text-step-status-danger-textDark px-4 py-3 rounded-lg mb-4 transition-colors duration-200">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-step-status-success-bg dark:bg-step-status-success-bgDark border border-step-status-success-text/20 dark:border-step-status-success-textDark/30 text-step-status-success-text dark:text-step-status-success-textDark px-4 py-3 rounded-lg mb-4 transition-colors duration-200">
            {success}
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <Select
            label="Client"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            options={[
              { value: '', label: 'Select a client...' },
              ...clients.map((client) => ({
                value: client.id,
                label: client.display_name,
              })),
            ]}
            required
            disabled={loadingClients}
          />

          <div>
            <label className="block text-xs font-medium text-step-text-muted uppercase tracking-wide mb-1">
              Modality
            </label>
            <select
              value={modality}
              onChange={(e) => {
                setModality(e.target.value as ModalityKey);
                setSelectedWorksheetId('');
              }}
              className="worksheet-select w-full px-4 py-2 border border-step-border dark:border-step-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-step-primary-500 text-sm md:text-[15px] text-step-text-main dark:text-step-dark-text-main transition-colors duration-200"
              required
            >
              <option value="CBT" className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">CBT</option>
              <option value="ERP" className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">ERP</option>
              <option value="DBT" className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">DBT</option>
              <option value="CBT-J" className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">CBT-J</option>
              <option value="SUD" className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">SUD</option>
            </select>
          </div>

          {modality && (
            <div>
              <label className="block text-xs font-medium text-step-text-muted uppercase tracking-wide mb-2">
                Worksheet
              </label>
              {availableWorksheets.length === 0 ? (
                <p className="text-sm md:text-[15px] text-step-text-muted italic">
                  No worksheets available yet for this modality.
                </p>
              ) : (
                <select
                  value={selectedWorksheetId}
                  onChange={(e) => setSelectedWorksheetId(e.target.value)}
                  className="worksheet-select w-full px-4 py-2 border border-step-border dark:border-step-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-step-primary-500 text-sm md:text-[15px] text-step-text-main dark:text-step-dark-text-main transition-colors duration-200"
                  required
                >
                  <option value="" className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">Select a worksheet...</option>
                  {availableWorksheets.map((worksheet) => (
                    <option key={worksheet.id} value={worksheet.id} className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">
                      {worksheet.title}
                      {worksheet.problemDomains.length > 0 && ` (${worksheet.problemDomains.join(', ')})`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {selectedWorksheet && (
            <div className="bg-step-surface border border-step-border rounded-lg p-4">
              <h3 className="text-base font-semibold text-step-text-main mb-2">
                {selectedWorksheet.title}
              </h3>
              {selectedWorksheet.description && (
                <p className="text-sm md:text-[15px] text-step-text-muted mb-2">
                  {selectedWorksheet.description}
                </p>
              )}
              <div className="text-xs text-step-text-muted">
                <div>Modality: {selectedWorksheet.modality}</div>
                {selectedWorksheet.modules.length > 0 && (
                  <div>Modules: {selectedWorksheet.modules.join(', ')}</div>
                )}
                {selectedWorksheet.problemDomains.length > 0 && (
                  <div>Problem Domains: {selectedWorksheet.problemDomains.join(', ')}</div>
                )}
              </div>
            </div>
          )}

          <Input
            label="Due Date (optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Textarea
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Add any context or instructions for this assignment..."
          />

          {selectedWorksheet && (
            <div className="flex gap-4 pt-4 border-t border-step-border">
              <Button
                type="button"
                onClick={handleSendToPatient}
                disabled={sending || !selectedClientId || !modality || !selectedWorksheetId}
              >
                {sending 
                  ? (selectedClient?.email ? 'Creating & Sending...' : 'Creating...')
                  : (selectedClient?.email ? 'Create Worksheet & Send Email' : 'Create Worksheet')
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>

      </div>
    </TherapistLayout>
  );
}

