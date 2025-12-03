'use client';

import React, { useState } from 'react';
import { WORKSHEET_DEFINITIONS } from '@/config/worksheetDefinitions';

interface HomeworkEntry {
  clientInitials: string;
  type: string;
  worksheetType?: string; // Optional: worksheet type ID for lookup
  date: string;
  keyMetric: string;
  status: 'on-track' | 'needs-attention' | 'high-risk';
}

interface RecentHomeworkTableProps {
  entries: HomeworkEntry[];
}

const statusConfig = {
  'on-track': { label: 'On track', className: 'bg-step-status-success-bg dark:bg-step-status-success-bgDark text-step-status-success-text dark:text-step-status-success-textDark transition-colors duration-200' },
  'needs-attention': { label: 'Needs attention', className: 'bg-step-status-warning-bg dark:bg-step-status-warning-bgDark text-step-status-warning-text dark:text-step-status-warning-textDark transition-colors duration-200' },
  'high-risk': { label: 'High risk', className: 'bg-step-status-danger-bg dark:bg-step-status-danger-bgDark text-step-status-danger-text dark:text-step-status-danger-textDark transition-colors duration-200' },
};

export const RecentHomeworkTable: React.FC<RecentHomeworkTableProps> = ({ entries }) => {
  const [filter, setFilter] = useState<'all' | 'needs-attention'>('all');

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.status === 'needs-attention' || e.status === 'high-risk');

  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg overflow-hidden transition-colors duration-200">
      <div className="p-6 border-b border-step-border dark:border-step-dark-border">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-heading-lg">Recent homework</h3>
          </div>
          
          {/* Filter pills */}
          {entries.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-body-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-step-primary-50 dark:bg-step-primary-900/30 text-step-primary-700 dark:text-step-primary-300 font-medium'
                    : 'bg-step-bg dark:bg-step-dark-bg text-step-text-muted dark:text-step-dark-text-muted hover:bg-step-border dark:hover:bg-step-dark-border'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('needs-attention')}
                className={`px-3 py-1 rounded-full text-body-sm transition-colors ${
                  filter === 'needs-attention'
                    ? 'bg-step-primary-50 dark:bg-step-primary-900/30 text-step-primary-700 dark:text-step-primary-300 font-medium'
                    : 'bg-step-bg dark:bg-step-dark-bg text-step-text-muted dark:text-step-dark-text-muted hover:bg-step-border dark:hover:bg-step-dark-border'
                }`}
              >
                Needs attention
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-step-border dark:divide-step-dark-border">
          <thead className="bg-step-bg dark:bg-step-dark-bg">
            <tr>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Client
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Worksheet
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Date
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Key metric
              </th>
              <th className="px-6 py-3 text-left text-label font-semibold text-step-text-muted dark:text-step-dark-text-muted">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-step-surface dark:bg-step-dark-surface divide-y divide-step-border dark:divide-step-dark-border">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-body-sm text-muted">
                  No recent homework entries yet.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry, index) => {
              const status = statusConfig[entry.status];
              return (
                <tr key={index} className="hover:bg-step-primary-50 dark:hover:bg-step-primary-900/30 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-body-sm font-medium text-step-text-main dark:text-step-dark-text-main">{entry.clientInitials}</span>
                  </td>
                <td className="px-6 py-4">
                  <span className="text-body-sm text-step-text-main dark:text-step-dark-text-main">
                    {entry.worksheetType && WORKSHEET_DEFINITIONS[entry.worksheetType as keyof typeof WORKSHEET_DEFINITIONS]
                      ? WORKSHEET_DEFINITIONS[entry.worksheetType as keyof typeof WORKSHEET_DEFINITIONS].title
                      : entry.type}
                  </span>
                </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-body-sm text-muted">{entry.date}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-body-sm text-step-text-main dark:text-step-dark-text-main">{entry.keyMetric}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

