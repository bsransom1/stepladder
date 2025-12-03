'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { WorksheetForm } from './worksheets/WorksheetForm';
import { worksheetsByModality, getWorksheetById } from '@/data/worksheets';
import type { WorksheetTemplate } from '@/lib/types/worksheet';

type ModalityKey = keyof typeof worksheetsByModality;

interface ConfigureWorksheetDialogProps {
  initialModality?: ModalityKey;
  initialWorksheetId?: string;
  initialConfigValues?: Record<string, any>;
  showAssignmentFields?: boolean; // If true, show dueDate and note fields
  initialDueDate?: string;
  initialNote?: string;
  onClose: () => void;
  onSave: (config: {
    worksheetId: string;
    modality: string;
    title: string;
    clinicianConfigValues: Record<string, any>;
    dueDate?: string;
    note?: string;
  }) => void;
}

export const ConfigureWorksheetDialog: React.FC<ConfigureWorksheetDialogProps> = ({
  initialModality,
  initialWorksheetId,
  initialConfigValues = {},
  showAssignmentFields = false,
  initialDueDate = '',
  initialNote = '',
  onClose,
  onSave,
}) => {
  const [selectedModality, setSelectedModality] = useState<ModalityKey>(
    initialModality || 'CBT'
  );
  const [selectedWorksheetId, setSelectedWorksheetId] = useState<string>(
    initialWorksheetId || ''
  );
  const [configValues, setConfigValues] = useState<Record<string, any>>(
    initialConfigValues
  );
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState('');

  // Get available worksheets for the selected modality
  const availableWorksheets: WorksheetTemplate[] =
    worksheetsByModality[selectedModality] ?? [];

  const selectedTemplate = selectedWorksheetId
    ? getWorksheetById(selectedWorksheetId)
    : null;

  const handleWorksheetSelect = (worksheetId: string) => {
    setSelectedWorksheetId(worksheetId);
    // Reset config values when switching worksheets
    if (worksheetId !== initialWorksheetId) {
      setConfigValues({});
    } else {
      setConfigValues(initialConfigValues);
    }
    setError('');
  };

  const handleFormSubmit = (values: Record<string, any>) => {
    if (!selectedTemplate) {
      setError('Please select a worksheet');
      return;
    }

    onSave({
      worksheetId: selectedTemplate.id,
      modality: selectedTemplate.modality,
      title: selectedTemplate.title,
      clinicianConfigValues: values,
      dueDate: showAssignmentFields ? (dueDate || undefined) : undefined,
      note: showAssignmentFields ? (note || undefined) : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-colors duration-200">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="p-6">
          <h2 className="text-heading-xl mb-6">Configure Worksheet</h2>

          {error && (
            <div className="bg-step-status-danger-bg dark:bg-red-900/30 border border-step-status-danger-text/20 dark:border-red-500/30 text-step-status-danger-text dark:text-red-400 px-4 py-3 rounded-lg mb-4 transition-colors duration-200">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Modality Selection */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Modality
              </label>
              <select
                value={selectedModality}
                onChange={(e) => {
                  const newModality = e.target.value as ModalityKey;
                  setSelectedModality(newModality);
                  setSelectedWorksheetId('');
                  setConfigValues({});
                  setError('');
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-[15px] text-foreground bg-card transition-colors duration-200 border-border"
              >
                <option value="CBT">CBT</option>
                <option value="ERP">ERP</option>
                <option value="DBT">DBT</option>
                <option value="CBT-J">CBT-J</option>
                <option value="SUD">SUD</option>
              </select>
            </div>

            {/* Worksheet Selection */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Worksheet Template
              </label>
              <select
                value={selectedWorksheetId}
                onChange={(e) => handleWorksheetSelect(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-[15px] text-foreground bg-card transition-colors duration-200 border-border"
              >
                <option value="">Select a worksheet...</option>
                {availableWorksheets.map((worksheet) => (
                  <option key={worksheet.id} value={worksheet.id}>
                    {worksheet.title}
                    {worksheet.problemDomains.length > 0 &&
                      ` (${worksheet.problemDomains.join(', ')})`}
                  </option>
                ))}
              </select>
              {availableWorksheets.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  No worksheets available for this modality.
                </p>
              )}
            </div>

            {/* Configuration Form */}
            {selectedTemplate && (() => {
              // Filter to only show clinician-configurable fields
              const configurableFields = selectedTemplate.fields.filter(
                (field) => field.clinicianConfigurable === true
              );
              
              // Create a filtered template with only configurable fields
              const configTemplate = {
                ...selectedTemplate,
                fields: configurableFields,
              };

              return (
                <div className="border-t border-border pt-6">
                  <h3 className="text-heading-md mb-4">
                    Configure Worksheet Fields
                  </h3>
                  {configurableFields.length === 0 ? (
                    <div className="bg-step-status-info-bg dark:bg-step-status-info-bgDark border border-step-status-info-text/20 dark:border-step-status-info-textDark/30 rounded-lg p-6 mb-4">
                      <p className="text-body-sm text-step-status-info-text dark:text-step-status-info-textDark">
                        <strong>No configuration needed.</strong> This worksheet will be filled out entirely by the patient. 
                        You can set a due date and add a note below if needed.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-body-sm text-muted-foreground mb-4">
                        Configure initial values that will pre-populate the worksheet for your client. 
                        All other fields will be filled out by the patient.
                      </p>
                      <div className="[&_button[type='submit']]:hidden">
                        <WorksheetForm
                          template={configTemplate}
                          defaultValues={configValues}
                          onSubmit={handleFormSubmit}
                        />
                      </div>
                    </>
                  )}

                  {showAssignmentFields && (
                    <div className="mt-6 space-y-4 border-t border-border pt-6">
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
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t border-border mt-6">
                    <Button
                      onClick={() => {
                        if (configurableFields.length === 0) {
                          // No configurable fields, just save with empty config
                          handleFormSubmit({});
                        } else {
                          // Trigger form submission
                          const form = document.querySelector('form');
                          if (form) {
                            const submitButton = form.querySelector(
                              'button[type="submit"]'
                            ) as HTMLButtonElement;
                            if (submitButton) {
                              submitButton.click();
                            }
                          }
                        }
                      }}
                    >
                      {configurableFields.length === 0 ? 'Assign Worksheet' : 'Save Configuration'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

