'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TherapistLayout } from '@/components/TherapistLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { WorksheetForm } from '@/components/worksheets/WorksheetForm';
import { getAuthHeaders } from '@/lib/auth-client';
import { worksheetsByModality, getWorksheetById } from '@/data/worksheets';
import { createAssignment } from '@/data/worksheet-assignments';
import type { WorksheetTemplate } from '@/lib/types/worksheet';

type ModalityKey = keyof typeof worksheetsByModality; // "CBT" | "ERP" | "DBT" | "CBT-J" | "SUD"

type PendingWorksheetAssignment = {
  worksheetId: string;
  modality: string;
  title: string;
  clinicianConfigValues: Record<string, any>;
};

export default function NewClientPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [justCreateClient, setJustCreateClient] = useState(false);
  const [primaryModality, setPrimaryModality] = useState<ModalityKey>('CBT');
  const [pendingAssignments, setPendingAssignments] = useState<PendingWorksheetAssignment[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfigureForm, setShowConfigureForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>('');
  const [configValues, setConfigValues] = useState<Record<string, any>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    // Validation
    if (!displayName.trim()) {
      setError('Display Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      setEmailError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!justCreateClient && !primaryModality) {
      setError('Primary Modality is required');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        display_name: displayName,
        email: email.trim() || undefined,
      };

      if (justCreateClient) {
        // Just create client - no modality or worksheets
        payload.primary_modality = 'ERP'; // Default, but won't be used for worksheets
        payload.initialWorksheets = [];
        payload.sendWorksheet = false;
      } else {
        // Full flow - create client with worksheets
        payload.primary_modality = primaryModality;
        payload.initialWorksheets = [];
        payload.sendWorksheet = false; // We'll create assignments using the new system
      }

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create client');
        setLoading(false);
        return;
      }

      // Create worksheet assignments using the new in-memory repository
      const createdAssignments: Array<{ id: string; worksheetId: string }> = [];
      
      if (!justCreateClient && pendingAssignments.length > 0) {
        try {
          pendingAssignments.forEach((pending) => {
            const assignment = createAssignment({
              clientId: data.client.id,
              worksheetId: pending.worksheetId,
              dueDate: dueDate || undefined,
              note: 'Initial assignment created at intake',
              clinicianConfigValues: pending.clinicianConfigValues,
            });
            
            createdAssignments.push({
              id: assignment.id,
              worksheetId: assignment.worksheetId,
            });
          });
        } catch (assignmentError: any) {
          console.error('Failed to create assignments:', assignmentError);
          // Don't fail the whole flow if assignments fail, but log it
        }
      }

      // Send email notification if worksheets were assigned and client has email
      if (createdAssignments.length > 0 && data.client.email) {
        // Fire-and-forget; don't block UX on email
        fetch('/api/email/send-worksheet-assignment-for-assignments', {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientEmail: data.client.email,
            clientName: data.client.display_name || 'Client',
            assignments: createdAssignments,
          }),
        }).catch((error) => {
          console.error('Failed to send worksheet assignment email:', error);
          // Don't show error to user - email failure shouldn't break the flow
        });
      }

      // Redirect to client overview page (not worksheets subpage)
      router.push(`/clients/${data.client.id}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };


  return (
    <TherapistLayout>
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-step-text-main tracking-tight mb-6">Add New Client</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30 text-step-status-danger-text dark:text-step-status-danger-textDark px-4 py-3 rounded-lg transition-colors duration-200">
              {error}
            </div>
          )}
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="e.g., J.D."
          />
          <Input
            label="Patient E-Mail Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Clear email error when user starts typing
              if (emailError) {
                setEmailError('');
              }
            }}
            onBlur={(e) => {
              // Validate email on blur
              const emailValue = e.target.value.trim();
              if (!emailValue) {
                setEmailError('Email is required');
              } else {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailValue)) {
                  setEmailError('Please enter a valid email address');
                } else {
                  setEmailError('');
                }
              }
            }}
            placeholder="patient@example.com"
            required
            error={emailError}
          />

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={justCreateClient}
                onChange={(e) => {
                  setJustCreateClient(e.target.checked);
                  if (e.target.checked) {
                    // Clear worksheets when toggling to "just create"
                    setPendingAssignments([]);
                    setSelectedWorksheetId('');
                    setConfigValues({});
                  }
                }}
                className="h-4 w-4 text-step-primary-600 focus:ring-step-primary-500 border-step-border rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-step-text-main">
                Just create client (don't send worksheet yet)
              </label>
            </div>
          </div>

          {!justCreateClient && (
            <>
              <div>
                <label className="block text-xs font-medium text-step-text-muted uppercase tracking-wide mb-1">
                  Primary Modality
                </label>
                <select
                  value={primaryModality}
                  onChange={(e) => {
                    const newModality = e.target.value as ModalityKey;
                    setPrimaryModality(newModality);
                    // Clear configuration when modality changes
                    setSelectedWorksheetId('');
                    setConfigValues({});
                  }}
                  className="w-full px-4 py-2 border border-step-border rounded-lg focus:outline-none focus:ring-2 focus:ring-step-primary-500 text-sm md:text-[15px] text-step-text-main bg-step-surface"
                  required={!justCreateClient}
                >
                  <option value="CBT">CBT</option>
                  <option value="ERP">ERP</option>
                  <option value="DBT">DBT</option>
                  <option value="CBT-J">CBT-J</option>
                  <option value="SUD">SUD</option>
                </select>
              </div>

              <Input
                label="Due Date (optional)"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />

              {primaryModality && (
                <section className="mt-6">
                  <div className="mb-4">
                    <h2 className="text-lg md:text-xl font-semibold text-step-text-main mb-2">
                      Configure Worksheets
                    </h2>
                    <p className="text-sm md:text-[15px] text-step-text-muted">
                      Add and configure worksheets tailored for this client.
                    </p>
                  </div>

                  {/* Inline Configuration Form */}
                  <div className="border border-step-border rounded-lg p-6 bg-step-surface mb-4" data-config-section>
                      <div className="space-y-4">
                        {/* Worksheet Selection */}
                        <div>
                          <label className="block text-xs font-medium text-step-text-muted uppercase tracking-wide mb-2">
                            Worksheet Template
                          </label>
                          <select
                            value={selectedWorksheetId}
                            onChange={(e) => {
                              const worksheetId = e.target.value;
                              setSelectedWorksheetId(worksheetId);
                              // Reset config when switching worksheets (unless editing)
                              if (editingIndex === null || pendingAssignments[editingIndex]?.worksheetId !== worksheetId) {
                                setConfigValues({});
                              } else {
                                setConfigValues(pendingAssignments[editingIndex].clinicianConfigValues);
                              }
                              // Auto-save when a worksheet is selected
                              if (worksheetId) {
                                const template = getWorksheetById(worksheetId);
                                if (template) {
                                  const configurableFields = template.fields.filter(
                                    (field) => field.clinicianConfigurable === true
                                  );
                                  if (configurableFields.length === 0) {
                                    // No configurable fields, auto-add to pending assignments
                                    if (editingIndex !== null) {
                                      setPendingAssignments((prev) => {
                                        const updated = [...prev];
                                        updated[editingIndex] = {
                                          worksheetId: template.id,
                                          modality: template.modality,
                                          title: template.title,
                                          clinicianConfigValues: {},
                                        };
                                        return updated;
                                      });
                                      setEditingIndex(null);
                                    } else {
                                      setPendingAssignments((prev) => [
                                        ...prev,
                                        {
                                          worksheetId: template.id,
                                          modality: template.modality,
                                          title: template.title,
                                          clinicianConfigValues: {},
                                        },
                                      ]);
                                    }
                                    setSelectedWorksheetId('');
                                    setConfigValues({});
                                  }
                                }
                              }
                            }}
                            className="w-full px-4 py-2 border border-step-border rounded-lg focus:outline-none focus:ring-2 focus:ring-step-primary-500 text-sm md:text-[15px] text-step-text-main bg-step-bg"
                          >
                            <option value="">Select a worksheet...</option>
                            {(worksheetsByModality[primaryModality] ?? []).map((worksheet) => (
                              <option key={worksheet.id} value={worksheet.id}>
                                {worksheet.title}
                                {worksheet.problemDomains.length > 0 &&
                                  ` (${worksheet.problemDomains.join(', ')})`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Configuration Form */}
                        {selectedWorksheetId && (() => {
                          const template = getWorksheetById(selectedWorksheetId);
                          if (!template) return null;
                          
                          // Filter to only show clinician-configurable fields
                          const configurableFields = template.fields.filter(
                            (field) => field.clinicianConfigurable === true
                          );
                          
                          // Create a filtered template with only configurable fields
                          const configTemplate = {
                            ...template,
                            fields: configurableFields,
                          };
                          
                          return (
                            <div className="border-t border-step-border pt-4">
                              {configurableFields.length === 0 ? (
                                <div className="bg-step-status-info-bg dark:bg-step-status-info-bgDark border border-step-status-info-text/20 dark:border-step-status-info-textDark/30 rounded-lg p-4 mb-4">
                                  <p className="text-sm text-step-status-info-text dark:text-step-status-info-textDark">
                                    <strong>No configuration needed.</strong> This worksheet will be filled out entirely by the patient. 
                                    You can set a due date and add a note below if needed.
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-step-text-muted mb-4">
                                    Configure initial values that will pre-populate the worksheet for your client. 
                                    All other fields will be filled out by the patient.
                                  </p>
                                  <div className="[&_button[type='submit']]:hidden">
                                    <WorksheetForm
                                      template={configTemplate}
                                      defaultValues={configValues}
                                      onSubmit={(values) => {
                                    if (editingIndex !== null) {
                                      // Update existing pending assignment
                                      setPendingAssignments((prev) => {
                                        const updated = [...prev];
                                        updated[editingIndex] = {
                                          worksheetId: template.id,
                                          modality: template.modality,
                                          title: template.title,
                                          clinicianConfigValues: values,
                                        };
                                        return updated;
                                      });
                                    } else {
                                      // Add new pending assignment
                                      setPendingAssignments((prev) => [
                                        ...prev,
                                        {
                                          worksheetId: template.id,
                                          modality: template.modality,
                                          title: template.title,
                                          clinicianConfigValues: values,
                                        },
                                      ]);
                                    }
                                    setEditingIndex(null);
                                    setSelectedWorksheetId('');
                                    setConfigValues({});
                                  }}
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                  {/* Pending Assignments List */}
                  {pendingAssignments.length > 0 && (
                    <div className="space-y-3 border border-step-border rounded-lg p-4 bg-step-surface">
                      {pendingAssignments.map((pending, index) => {
                        const configuredFieldsCount = Object.keys(
                          pending.clinicianConfigValues
                        ).length;
                        return (
                          <div
                            key={`${pending.worksheetId}-${index}`}
                            className="flex items-start justify-between gap-4 p-3 bg-step-bg dark:bg-step-dark-bg rounded-lg border border-step-border"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-sm font-medium text-step-text-main">
                                  {pending.title}
                                </h3>
                                <span className="px-2 py-0.5 text-xs font-medium text-step-text-muted bg-step-surface dark:bg-step-dark-surface rounded border border-step-border">
                                  {pending.modality}
                                </span>
                                {configuredFieldsCount > 0 && (
                                  <span className="px-2 py-0.5 text-xs font-medium text-step-status-success-text bg-step-status-success-bg rounded border border-step-status-success-text/20">
                                    {configuredFieldsCount} field{configuredFieldsCount !== 1 ? 's' : ''} configured
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingIndex(index);
                                  setSelectedWorksheetId(pending.worksheetId);
                                  setConfigValues(pending.clinicianConfigValues);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPendingAssignments((prev) =>
                                    prev.filter((_, i) => i !== index)
                                  );
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !displayName.trim() || !email.trim() || (!justCreateClient && !primaryModality)}
            >
              {loading 
                ? 'Creating...' 
                : justCreateClient 
                  ? 'Create Client' 
                  : 'Create Client & Send Worksheet'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </TherapistLayout>
  );
}

