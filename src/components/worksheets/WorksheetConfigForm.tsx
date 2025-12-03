'use client';

import React from 'react';
import { WorksheetType, WorksheetDefinition } from '@/config/worksheetDefinitions';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Select } from '../Select';

interface WorksheetConfigFormProps {
  worksheetType: WorksheetType;
  definition: WorksheetDefinition;
  value: Record<string, any>;
  onChange: (next: Record<string, any>) => void;
}

export const WorksheetConfigForm: React.FC<WorksheetConfigFormProps> = ({
  worksheetType,
  definition,
  value,
  onChange,
}) => {
  const configFields = definition.configFields || [];

  if (configFields.length === 0) {
    return (
      <p className="text-sm md:text-[15px] text-step-text-muted italic">
        No configuration required for this worksheet type.
      </p>
    );
  }

  const handleFieldChange = (key: string, fieldValue: any) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  return (
    <div className="space-y-4">
      {configFields.map((field) => {
        const fieldValue = value[field.key] !== undefined ? value[field.key] : field.defaultValue;

        switch (field.type) {
          case 'text':
            return (
              <div key={field.key}>
                <Input
                  label={field.label}
                  value={fieldValue || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                  placeholder={field.description}
                />
                {field.description && (
                  <p className="mt-1 text-xs text-step-text-muted">{field.description}</p>
                )}
              </div>
            );

          case 'textarea':
            return (
              <div key={field.key}>
                <Textarea
                  label={field.label}
                  value={fieldValue || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                  placeholder={field.description}
                  rows={4}
                />
                {field.description && (
                  <p className="mt-1 text-xs text-step-text-muted">{field.description}</p>
                )}
              </div>
            );

          case 'number':
            return (
              <div key={field.key}>
                <Input
                  label={field.label}
                  type="number"
                  value={fieldValue || ''}
                  onChange={(e) =>
                    handleFieldChange(
                      field.key,
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  required={field.required}
                />
                {field.description && (
                  <p className="mt-1 text-xs text-step-text-muted">{field.description}</p>
                )}
              </div>
            );

          case 'select':
            return (
              <div key={field.key}>
                <Select
                  label={field.label}
                  value={fieldValue || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  required={field.required}
                  options={[
                    { value: '', label: `Select ${field.label.toLowerCase()}...` },
                    ...(field.options || []),
                  ]}
                />
                {field.description && (
                  <p className="mt-1 text-xs text-step-text-muted">{field.description}</p>
                )}
              </div>
            );

          case 'checkbox':
            return (
              <div key={field.key} className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={fieldValue || false}
                    onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                    className="h-4 w-4 text-step-primary-600 focus:ring-step-primary-500 border-step-border rounded"
                  />
                </div>
                <div className="ml-3 text-sm md:text-[15px]">
                  <label className="font-medium text-step-text-main">{field.label}</label>
                  {field.description && (
                    <p className="text-step-text-muted">{field.description}</p>
                  )}
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

