'use client';

import React from 'react';
import { WorksheetDefinition } from '@/config/worksheetDefinitions';

interface WorksheetAnalyticsPanelProps {
  definition: WorksheetDefinition;
  metrics: Record<string, any>;
  entries: any[];
  renderChart?: (entries: any[], chartTitle?: string) => React.ReactNode;
  renderTable?: (entries: any[], tableTitle?: string) => React.ReactNode;
}

export const WorksheetAnalyticsPanel: React.FC<WorksheetAnalyticsPanelProps> = ({
  definition,
  metrics = {},
  entries = [],
  renderChart,
  renderTable,
}) => {
  const analytics = definition.analytics;

  if (!analytics) {
    return (
      <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
        <h3 className="text-heading-lg mb-6">Analytics</h3>
        <p className="text-body-sm text-muted">No analytics available for this worksheet type.</p>
      </div>
    );
  }

  const getKpiValue = (kpi: any) => {
    const rawValue = metrics[kpi.valueKey];
    if (kpi.format && typeof kpi.format === 'function') {
      return kpi.format(rawValue);
    }
    return rawValue || 0;
  };

  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
      <h3 className="text-heading-lg mb-6">
        {analytics.kpiTitle || 'Analytics'}
      </h3>

      {/* Mini KPI chips */}
      {analytics.kpis && analytics.kpis.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mb-6">
          {analytics.kpis.map((kpi) => (
            <div key={kpi.id} className="bg-step-bg dark:bg-step-dark-bg border border-step-border dark:border-step-dark-border rounded-lg p-3 transition-colors duration-200">
              <p className="text-label mb-1">{kpi.label}</p>
              {kpi.description && (
                <p className="text-caption mb-1 text-step-text-muted/70 dark:text-step-dark-text-muted/70">{kpi.description}</p>
              )}
              <p className="text-heading-md font-semibold text-step-text-main dark:text-step-dark-text-main">
                {getKpiValue(kpi)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {analytics.chartTitle && (
        <div className="mb-4">
          {renderChart ? (
            renderChart(entries, analytics.chartTitle)
          ) : (
            <div>
              <h4 className="text-heading-sm font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
                {analytics.chartTitle}
              </h4>
              <div className="h-48 bg-step-bg dark:bg-step-dark-bg border border-step-border dark:border-step-dark-border rounded-lg flex items-center justify-center transition-colors duration-200">
                <p className="text-body-sm text-muted">
                  {entries.length === 0 ? 'No entries logged yet' : 'Chart placeholder'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary text */}
      {analytics.summaryKey && metrics[analytics.summaryKey] && (
        <p className="text-body-sm text-muted border-t border-step-border dark:border-step-dark-border pt-4">
          {metrics[analytics.summaryKey]}
        </p>
      )}

      {/* Table */}
      {analytics.tableTitle && renderTable && (
        <div className="mt-6">
          {renderTable(entries, analytics.tableTitle)}
        </div>
      )}
    </div>
  );
};

