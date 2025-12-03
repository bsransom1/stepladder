'use client';

import React from 'react';
import { Button } from './Button';
import { WorksheetType, WorksheetDefinition } from '@/config/worksheetDefinitions';
import { Client } from '@/types';

interface WorksheetPreviewModalProps {
  client: Client | null;
  worksheetType: WorksheetType;
  definition: WorksheetDefinition;
  config: Record<string, any>;
  onClose: () => void;
}

export const WorksheetPreviewModal: React.FC<WorksheetPreviewModalProps> = ({
  client,
  worksheetType,
  definition,
  config,
  onClose,
}) => {
  const formatConfigValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not specified';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-step-surface rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-step-text-main tracking-tight">Worksheet Preview</h2>
              {client && (
                <p className="text-xs md:text-sm text-step-text-muted mt-1">
                  For: {client.display_name}
                  {client.email && ` (${client.email})`}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="space-y-6">
            {/* Worksheet Header */}
            <div className="border-b border-step-border pb-4">
              <h3 className="text-lg md:text-xl font-semibold text-step-text-main">{definition.title}</h3>
              {definition.description && (
                <p className="text-sm md:text-[15px] text-step-text-muted mt-2">{definition.description}</p>
              )}
            </div>

            {/* Configuration Details */}
            <div>
              <h4 className="text-base font-semibold text-step-text-main mb-4">Configuration</h4>
              <div className="bg-step-bg border border-step-border rounded-lg p-4 space-y-3">
                {definition.configFields && definition.configFields.length > 0 ? (
                  definition.configFields.map((field) => {
                    const value = config[field.key] !== undefined 
                      ? config[field.key] 
                      : field.defaultValue;
                    return (
                      <div key={field.key} className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="font-medium text-step-text-main">{field.label}</span>
                          {field.description && (
                            <p className="text-xs text-step-text-muted mt-0.5">{field.description}</p>
                          )}
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-step-text-main">{formatConfigValue(field.key, value)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm md:text-[15px] text-step-text-muted italic">No configuration fields defined.</p>
                )}
              </div>
            </div>

            {/* Instructions Preview */}
            {config.instructions && (
              <div>
                <h4 className="text-base font-semibold text-step-text-main mb-2">Instructions</h4>
                <div className="bg-step-status-info-bg border border-step-status-info-text/20 rounded-lg p-4">
                  <p className="text-sm md:text-[15px] text-step-text-main whitespace-pre-wrap">{config.instructions}</p>
                </div>
              </div>
            )}

            {/* Worksheet Type Info */}
            <div className="bg-step-bg border border-step-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm md:text-[15px]">
                <div>
                  <span className="text-step-text-muted">Worksheet Type:</span>
                  <span className="ml-2 font-medium text-step-text-main">{definition.title}</span>
                </div>
                <div>
                  <span className="text-step-text-muted">Type ID:</span>
                  <span className="ml-2 font-medium text-step-text-main">{worksheetType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

