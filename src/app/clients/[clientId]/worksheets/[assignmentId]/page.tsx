'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { TherapistLayout } from '@/components/TherapistLayout';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { WorksheetForm } from '@/components/worksheets/WorksheetForm';
import { getAuthHeaders } from '@/lib/auth-client';
import { Client } from '@/types';
import {
  getAssignmentById,
  saveAssignmentResponse,
  updateAssignmentStatus,
} from '@/data/worksheet-assignments';
import { getWorksheetById } from '@/data/worksheets';
import type { WorksheetAssignment } from '@/lib/types/worksheet-assignment';
import type { WorksheetResponse } from '@/lib/types/worksheet-assignment';

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.clientId as string;
  const assignmentId = params.assignmentId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [assignment, setAssignment] = useState<WorksheetAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (clientId && assignmentId) {
      fetchData();
    }
  }, [clientId, assignmentId]);

  const fetchData = async () => {
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

      // Load assignment from in-memory repository
      const assignmentData = getAssignmentById(assignmentId);
      if (!assignmentData) {
        setError('Assignment not found');
        setLoading(false);
        return;
      }

      // Basic guard: ensure assignment belongs to client
      if (assignmentData.clientId !== clientId) {
        setError('Assignment does not belong to this client');
        setLoading(false);
        return;
      }

      setAssignment(assignmentData);
      // Initialize form values from existing response
      if (assignmentData.response?.values) {
        setFormValues(assignmentData.response.values);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const extractFormValues = (): Record<string, any> => {
    const form = document.querySelector('form');
    if (!form) return formValues;

    const values: Record<string, any> = {};
    
    // Get all inputs, textareas, and selects
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input) => {
      const element = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const fieldId = element.id || element.name;
      
      if (!fieldId) return;

      if (element.type === 'checkbox') {
        // Handle checkbox groups
        const checkboxes = form.querySelectorAll(`input[type="checkbox"][id="${fieldId}"], input[type="checkbox"][name="${fieldId}"]`);
        if (checkboxes.length > 1) {
          // Checkbox group - collect all checked values
          const checkedValues: string[] = [];
          checkboxes.forEach((cb) => {
            if ((cb as HTMLInputElement).checked) {
              checkedValues.push((cb as HTMLInputElement).value);
            }
          });
          values[fieldId] = checkedValues.length > 0 ? checkedValues : undefined;
        } else {
          // Single checkbox
          values[fieldId] = (element as HTMLInputElement).checked;
        }
      } else if (element.type === 'radio') {
        // Radio buttons - get checked value
        const radio = form.querySelector(`input[type="radio"][name="${fieldId}"]:checked`) as HTMLInputElement;
        if (radio) {
          values[fieldId] = radio.value;
        }
      } else if (element.tagName === 'SELECT' && (element as HTMLSelectElement).multiple) {
        // Multi-select
        const select = element as HTMLSelectElement;
        const selectedValues = Array.from(select.selectedOptions).map(opt => opt.value);
        values[fieldId] = selectedValues.length > 0 ? selectedValues : undefined;
      } else if (element.type === 'number') {
        // Number inputs
        const numValue = (element as HTMLInputElement).value;
        values[fieldId] = numValue !== '' ? parseFloat(numValue) : undefined;
      } else {
        // Text, textarea, date, time, single select
        values[fieldId] = element.value || undefined;
      }
    });

    // Handle rating_0_10 fields (rendered as buttons, not inputs)
    // Look for button groups that might represent rating fields
    // Note: This is a fallback - the primary method is via onSubmit callback
    const buttonGroups = form.querySelectorAll('div[class*="flex gap-2"]');
    buttonGroups.forEach((group) => {
      const buttons = group.querySelectorAll('button[type="button"]');
      if (buttons.length === 11) {
        // Likely a rating_0_10 field
        const activeButton = Array.from(buttons).find((btn) =>
          btn.className.includes('bg-step-primary-500')
        );
        if (activeButton) {
          // Try to find the field ID from the label
          const label = group.previousElementSibling as HTMLLabelElement;
          if (label) {
            const fieldId = label.getAttribute('for') || label.textContent?.trim().toLowerCase().replace(/\s+/g, '_');
            if (fieldId) {
              const value = parseInt(activeButton.textContent || '0');
              if (!isNaN(value)) {
                values[fieldId] = value;
              }
            }
          }
        }
      }
    });

    return values;
  };

  const handleSave = async (markComplete: boolean) => {
    if (!assignment) return;

    setSaving(true);
    setError('');

    try {
      // Extract current form values
      const currentValues = extractFormValues();
      
      // Use extracted values, or fall back to formValues state if extraction failed
      const valuesToSave = Object.keys(currentValues).length > 0 ? currentValues : formValues;

      const response: WorksheetResponse = {
        values: valuesToSave,
        submittedAt: new Date().toISOString(),
      };

      saveAssignmentResponse(assignment.id, response);

      if (markComplete) {
        updateAssignmentStatus(assignment.id, 'completed');
      }

      // Refresh assignment data
      const updatedAssignment = getAssignmentById(assignment.id);
      if (updatedAssignment) {
        setAssignment(updatedAssignment);
        if (updatedAssignment.response?.values) {
          setFormValues(updatedAssignment.response.values);
        }
      }

      // Show success (could use a toast system if available)
      if (markComplete) {
        alert('Worksheet completed successfully!');
      } else {
        alert('Progress saved successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save worksheet');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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

  if (loading) {
    return (
      <TherapistLayout>
        <div className="p-8">
          <LoadingSpinner size={48} />
        </div>
      </TherapistLayout>
    );
  }

  if (error || !assignment || !client) {
    return (
      <TherapistLayout>
        <div className="p-8">
          <p className="text-red-400">{error || 'Assignment not found'}</p>
          <Link
            href={`/clients/${clientId}`}
            className="text-body-sm text-muted-foreground hover:text-foreground mt-4 inline-block"
          >
            ← Back to Client
          </Link>
        </div>
      </TherapistLayout>
    );
  }

  const worksheet = getWorksheetById(assignment.worksheetId);
  if (!worksheet) {
    return (
      <TherapistLayout>
        <div className="p-8">
          <p className="text-red-400">Worksheet template not found</p>
          <Link
            href={`/clients/${clientId}`}
            className="text-body-sm text-muted-foreground hover:text-foreground mt-4 inline-block"
          >
            ← Back to Client
          </Link>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/clients/${clientId}`}
            className="text-body-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to Client
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-display">{worksheet.title}</h1>
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
          <div className="flex flex-wrap gap-4 text-body-sm text-muted-foreground mb-4">
            <span>{worksheet.modality}</span>
            {worksheet.problemDomains.length > 0 && (
              <span>{worksheet.problemDomains.join(', ')}</span>
            )}
            {worksheet.evidenceTag && (
              <span className="italic">{worksheet.evidenceTag}</span>
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
            <div className="mt-4 p-4 bg-step-status-info-bg dark:bg-step-status-info-bgDark border border-step-status-info-text/20 dark:border-step-status-info-textDark/30 rounded-lg">
              <p className="text-body-sm text-step-status-info-text dark:text-step-status-info-textDark">
                <strong>Note:</strong> {assignment.note}
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-step-status-danger-bg dark:bg-red-900/30 border border-step-status-danger-text/20 dark:border-red-500/30 text-step-status-danger-text dark:text-red-400 px-4 py-3 rounded-lg mb-6 transition-colors duration-200">
            {error}
          </div>
        )}

        {/* Worksheet Form */}
        <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
          {assignment.status === 'completed' ? (
            <div className="mb-6">
              <div className="bg-step-status-success-bg dark:bg-step-status-success-bgDark border border-step-status-success-text/20 dark:border-step-status-success-textDark/30 text-step-status-success-text dark:text-step-status-success-textDark px-4 py-3 rounded-lg mb-6 transition-colors duration-200">
                <p className="text-body-sm">
                  <strong>Completed:</strong> This worksheet was completed on{' '}
                  {formatDate(assignment.completedAt || assignment.lastUpdatedAt)}.
                </p>
              </div>
              <div className="[&_button[type='submit']]:hidden">
                <WorksheetForm
                  template={worksheet}
                  defaultValues={assignment.response?.values || {}}
                  onSubmit={() => {
                    // Read-only view for completed assignments
                    alert('This assignment is already completed. View-only mode.');
                  }}
                />
              </div>
            </div>
          ) : (
            <div>
              {/* Therapist view is read-only - no editing or saving */}
              <WorksheetForm
                template={worksheet}
                defaultValues={{
                  ...(assignment.clinicianConfig?.values ?? {}),
                  ...(assignment.response?.values ?? {}),
                }}
                readOnly={true}
              />
            </div>
          )}
        </div>
      </div>
    </TherapistLayout>
  );
}

