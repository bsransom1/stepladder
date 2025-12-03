'use client';

import React from 'react';
import type { TimeRange } from '@/lib/mockAnalytics';

interface TimeRangeToggleProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const TimeRangeToggle: React.FC<TimeRangeToggleProps> = ({ value, onChange }) => {
  const options: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'This week' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
  ];

  return (
    <div className="inline-flex rounded-lg border border-step-border dark:border-step-dark-border bg-step-surface dark:bg-step-dark-surface p-1" role="group" aria-label="Time range selector">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
            value === option.value
              ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white'
              : 'text-step-text-muted dark:text-step-dark-text-muted hover:text-step-text-main dark:hover:text-step-dark-text-main hover:bg-step-bg dark:hover:bg-step-dark-bg'
          }`}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

