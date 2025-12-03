'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WorksheetForm } from '@/components/worksheets/WorksheetForm';
import { getAssignmentById, saveAssignmentResponse, updateAssignmentStatus } from '@/data/worksheet-assignments';
import { getWorksheetById } from '@/data/worksheets';
import type { WorksheetResponse } from '@/lib/types/worksheet-assignment';
import { Button } from '@/components/Button';

export default function PatientWorksheetPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;

  const [assignment, setAssignment] = useState<any>(null);
  const [worksheet, setWorksheet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignmentId) {
      loadAssignment();
    }
  }, [assignmentId]);

  const loadAssignment = () => {
    try {
      const assignmentData = getAssignmentById(assignmentId);
      if (!assignmentData) {
        setError('This worksheet link is invalid or has expired.');
        setLoading(false);
        return;
      }

      const worksheetData = getWorksheetById(assignmentData.worksheetId);
      if (!worksheetData) {
        setError('Worksheet template not found.');
        setLoading(false);
        return;
      }

      setAssignment(assignmentData);
      setWorksheet(worksheetData);

      // Check if already completed
      if (assignmentData.status === 'completed') {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Failed to load assignment:', err);
      setError('Failed to load worksheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: Record<string, any>) => {
    if (!assignment) return;

    setSubmitting(true);
    setError('');

    try {
      const response: WorksheetResponse = {
        values,
        submittedAt: new Date().toISOString(),
      };

      saveAssignmentResponse(assignment.id, response);
      updateAssignmentStatus(assignment.id, 'completed');

      // Refresh assignment data
      const updatedAssignment = getAssignmentById(assignment.id);
      if (updatedAssignment) {
        setAssignment(updatedAssignment);
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save worksheet');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-step-bg dark:bg-step-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-step-primary-500 mx-auto mb-4"></div>
          <p className="text-step-text-muted">Loading worksheet...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment || !worksheet) {
    return (
      <div className="min-h-screen bg-step-bg dark:bg-step-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 text-center">
          <h1 className="text-heading-xl mb-4 text-step-text-main">Worksheet Not Found</h1>
          <p className="text-body text-step-text-muted mb-6">{error || 'This worksheet link is invalid or has expired.'}</p>
          <p className="text-body-sm text-step-text-muted">
            If you believe this is an error, please contact your clinician.
          </p>
        </div>
      </div>
    );
  }

  // Compute default values: clinician config first, then patient response
  const defaultValues = {
    ...(assignment.clinicianConfig?.values ?? {}),
    ...(assignment.response?.values ?? {}),
  };

  return (
    <div className="min-h-screen bg-step-bg dark:bg-step-dark-bg">
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display mb-2">{worksheet.title}</h1>
          <p className="text-body text-step-text-muted mb-4">
            This worksheet was assigned by your clinician.
          </p>
          {assignment.dueDate && (
            <p className="text-body-sm text-step-text-muted">
              Due date: {formatDate(assignment.dueDate)}
            </p>
          )}
          {assignment.note && (
            <div className="mt-4 p-4 bg-step-status-info-bg dark:bg-step-status-info-bgDark border border-step-status-info-text/20 dark:border-step-status-info-textDark/30 rounded-lg">
              <p className="text-body-sm text-step-status-info-text dark:text-step-status-info-textDark">
                <strong>Note from your clinician:</strong> {assignment.note}
              </p>
            </div>
          )}
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="mb-6 bg-step-status-success-bg dark:bg-step-status-success-bgDark border border-step-status-success-text/20 dark:border-step-status-success-textDark/30 text-step-status-success-text dark:text-step-status-success-textDark px-6 py-4 rounded-lg">
            <h2 className="text-heading-md mb-2">✓ Worksheet Completed</h2>
            <p className="text-body-sm">
              Thank you for completing this worksheet. Your clinician has been notified.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-step-status-danger-bg dark:bg-step-status-danger-bgDark border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30 text-step-status-danger-text dark:text-step-status-danger-textDark px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Worksheet Form */}
        <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6">
          {submitted ? (
            <div>
              <p className="text-body text-step-text-muted mb-4">
                This worksheet has been completed. Your responses are shown below.
              </p>
              <WorksheetForm
                template={worksheet}
                defaultValues={defaultValues}
                readOnly={true}
              />
            </div>
          ) : (
            <WorksheetForm
              template={worksheet}
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              readOnly={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-body-sm text-step-text-muted">
            StepLadder Therapy Platform
          </p>
        </div>
      </div>
    </div>
  );
}

