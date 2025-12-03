'use client';

import React from 'react';
import { WORKSHEET_DEFINITIONS, WorksheetType } from '@/config/worksheetDefinitions';

interface ModalityData {
  label: string;
  detail: string;
  worksheetType?: WorksheetType; // Optional: for lookup in definitions
}

interface ModalitySnapshotProps {
  modalities: ModalityData[];
}

export const ModalitySnapshot: React.FC<ModalitySnapshotProps> = ({ modalities }) => {
  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
      <h3 className="text-lg md:text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">Modality snapshot</h3>
      <div className="flex flex-wrap gap-3">
        {modalities.map((modality, index) => {
          const displayLabel = modality.worksheetType && WORKSHEET_DEFINITIONS[modality.worksheetType]
            ? WORKSHEET_DEFINITIONS[modality.worksheetType].title
            : modality.label;
          
          return (
            <div
              key={index}
              className="px-4 py-2 bg-step-bg dark:bg-step-dark-bg border border-step-border dark:border-step-dark-border rounded-lg transition-colors duration-200"
            >
              <span className="text-sm md:text-[15px] font-medium text-step-text-main dark:text-step-dark-text-main">{displayLabel}:</span>{' '}
              <span className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted">{modality.detail}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

