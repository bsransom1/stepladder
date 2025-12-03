'use client';

import React from 'react';

interface ChartDataPoint {
  day: string;
  value: number;
}

interface HomeworkActivityChartProps {
  data: ChartDataPoint[];
  totalEntries: number;
  clientsLogged: number;
  totalClients: number;
}

export const HomeworkActivityChart: React.FC<HomeworkActivityChartProps> = ({
  data,
  totalEntries,
  clientsLogged,
  totalClients,
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
      <h3 className="text-lg md:text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">Homework activity (last 7 days)</h3>
      
      {/* Simple bar chart */}
      <div className="flex items-end justify-between gap-2 h-48 mb-4">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col items-center justify-end h-full">
              <div
                className="w-full bg-step-primary-600 dark:bg-step-primary-500 rounded-t transition-all hover:bg-step-primary-700 dark:hover:bg-step-primary-600"
                style={{ height: `${(point.value / maxValue) * 100}%` }}
                title={`${point.day}: ${point.value} entries`}
              />
            </div>
            <span className="text-xs text-step-text-muted dark:text-step-dark-text-muted mt-2">{point.day}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted border-t border-step-border dark:border-step-dark-border pt-4">
        Total entries: <span className="font-semibold text-step-text-main dark:text-step-dark-text-main">{totalEntries}</span> · 
        Clients who logged at least once: <span className="font-semibold text-step-text-main dark:text-step-dark-text-main">{clientsLogged} / {totalClients}</span>
      </div>
    </div>
  );
};

