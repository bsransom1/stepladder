'use client';

import React, { useState, FormEvent } from 'react';
import { WorksheetTemplate, WorksheetField } from '@/lib/types/worksheet';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';

interface WorksheetFormProps {
  template: WorksheetTemplate;
  defaultValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>) => void;
  readOnly?: boolean; // If true, form is read-only (no editing, no submit)
}

/**
 * Generic WorksheetForm Component
 * 
 * Renders a form dynamically based on a WorksheetTemplate schema.
 * This component is modality-agnostic and can render any worksheet
 * template that follows the Phase 1 schema.
 */
export const WorksheetForm: React.FC<WorksheetFormProps> = ({
  template,
  defaultValues = {},
  onSubmit,
  readOnly = false,
}) => {
  const [values, setValues] = useState<Record<string, any>>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (fieldId: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    template.fields.forEach((field) => {
      if (field.required) {
        const value = values[field.id];
        if (value === undefined || value === null || value === '') {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (readOnly) {
      return; // Don't submit in read-only mode
    }
    
    if (!validate()) {
      return;
    }

    if (onSubmit) {
      onSubmit(values);
    } else {
      console.log('Worksheet form values:', values);
    }
  };

  const renderField = (field: WorksheetField) => {
    const fieldValue = values[field.id] ?? '';
    const fieldError = errors[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            key={field.id}
            label={field.label}
            type="text"
            value={fieldValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={fieldError}
            required={field.required}
            disabled={readOnly}
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={field.id}
            label={field.label}
            value={fieldValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            error={fieldError}
            required={field.required}
            disabled={readOnly}
          />
        );

      case 'number':
        return (
          <Input
            key={field.id}
            label={field.label}
            type="number"
            value={fieldValue}
            onChange={(e) => handleChange(field.id, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            error={fieldError}
            required={field.required}
            min={field.min}
            max={field.max}
            disabled={readOnly}
          />
        );

      case 'rating_0_10':
        return (
          <div key={field.id} className="w-full">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => !readOnly && handleChange(field.id, i)}
                  disabled={readOnly}
                  className={`px-3 py-2 rounded-lg border transition-colors text-sm font-medium ${
                    fieldValue === i
                      ? 'bg-step-primary-500 text-white border-step-primary-500'
                      : 'bg-card text-foreground border-border hover:bg-muted'
                  } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {i}
                </button>
              ))}
            </div>
            {fieldError && (
              <p className="mt-1 text-xs text-red-400">{fieldError}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="w-full">
            <label className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={fieldValue || false}
                onChange={(e) => handleChange(field.id, e.target.checked)}
                disabled={readOnly}
                className="w-4 h-4 rounded border-border text-step-primary-500 focus:ring-step-primary-500"
              />
              <span className="text-sm font-medium text-foreground">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </span>
            </label>
            {field.description && (
              <p className="text-sm text-muted-foreground mt-1 ml-6">{field.description}</p>
            )}
            {fieldError && (
              <p className="mt-1 text-xs text-red-400">{fieldError}</p>
            )}
          </div>
        );

      case 'checkbox_group':
        if (!field.options || field.options.length === 0) {
          return null;
        }
        return (
          <div key={field.id} className="w-full">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="space-y-2">
              {field.options.map((option) => {
                const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isChecked = selectedValues.includes(option.value);
                return (
                  <label key={option.value} className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (readOnly) return;
                        const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                        if (e.target.checked) {
                          handleChange(field.id, [...currentValues, option.value]);
                        } else {
                          handleChange(field.id, currentValues.filter((v) => v !== option.value));
                        }
                      }}
                      disabled={readOnly}
                      className="w-4 h-4 rounded border-border text-step-primary-500 focus:ring-step-primary-500"
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                );
              })}
            </div>
            {fieldError && (
              <p className="mt-1 text-xs text-red-400">{fieldError}</p>
            )}
          </div>
        );

      case 'select':
        if (!field.options || field.options.length === 0) {
          return null;
        }
        return (
          <Select
            key={field.id}
            label={field.label}
            value={fieldValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            options={field.options}
            error={fieldError}
            required={field.required}
            disabled={readOnly}
          />
        );

      case 'multi_select':
        if (!field.options || field.options.length === 0) {
          return null;
        }
        return (
          <div key={field.id} className="w-full">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <select
              multiple
              value={Array.isArray(fieldValue) ? fieldValue : []}
              onChange={(e) => {
                if (readOnly) return;
                const selectedValues = Array.from(e.target.selectedOptions, (option) => option.value);
                handleChange(field.id, selectedValues);
              }}
              disabled={readOnly}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm md:text-[15px] text-foreground bg-card transition-colors duration-200 border-border"
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError && (
              <p className="mt-1 text-xs text-red-400">{fieldError}</p>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            key={field.id}
            label={field.label}
            type="date"
            value={fieldValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={fieldError}
            required={field.required}
            disabled={readOnly}
          />
        );

      case 'time':
        return (
          <Input
            key={field.id}
            label={field.label}
            type="time"
            value={fieldValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            error={fieldError}
            required={field.required}
            disabled={readOnly}
          />
        );

      case 'likert':
        if (!field.options || field.options.length === 0) {
          return null;
        }
        return (
          <div key={field.id} className="w-full">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.description && (
              <p className="text-sm text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {field.options.map((option) => (
                <label key={option.value} className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={fieldValue === option.value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    disabled={readOnly}
                    className="w-4 h-4 border-border text-step-primary-500 focus:ring-step-primary-500"
                  />
                  <span className="text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
            {fieldError && (
              <p className="mt-1 text-xs text-red-400">{fieldError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <h2 className="text-heading-lg mb-2">{template.title}</h2>
        {template.description && (
          <p className="text-body text-muted-foreground">{template.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {template.fields.map((field) => (
          <div key={field.id}>
            {renderField(field)}
          </div>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1">
            Submit
          </Button>
        </div>
      )}
    </form>
  );
};

/**
 * Internal example template for testing/preview purposes only.
 * This is NOT exported as part of a global worksheet library.
 * DO NOT reference specific modalities (CBT/DBT/etc) in example names.
 */
export const EXAMPLE_WORKSHEET_TEMPLATE: WorksheetTemplate = {
  id: 'example-worksheet',
  title: 'Example Worksheet',
  modality: 'Generic',
  modules: ['Example Module'],
  problemDomains: ['Example Domain'],
  description: 'This is an example worksheet template for testing the WorksheetForm component.',
  fields: [
    {
      id: 'text_field',
      label: 'Text Field',
      type: 'text',
      placeholder: 'Enter text here',
      required: true,
    },
    {
      id: 'rating_field',
      label: 'Rating (0-10)',
      type: 'rating_0_10',
      description: 'Rate your experience from 0 to 10',
      required: true,
    },
    {
      id: 'select_field',
      label: 'Select Option',
      type: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      required: true,
    },
  ],
};





