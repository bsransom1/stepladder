'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { OutcomePoint } from '@/lib/mockAnalytics';

interface LineChartCardProps {
  title: string;
  subtitle?: string;
  data: OutcomePoint[];
  metricSelector?: React.ReactNode;
  legend?: string;
}

export const LineChartCard: React.FC<LineChartCardProps> = ({
  title,
  subtitle,
  data,
  metricSelector,
  legend,
}) => {
  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted">
              {subtitle}
            </p>
          )}
        </div>
        {metricSelector && <div>{metricSelector}</div>}
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            stroke="currentColor"
            className="text-step-text-muted"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="currentColor"
            className="text-step-text-muted"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--step-surface))',
              border: '1px solid hsl(var(--step-border))',
              borderRadius: '8px',
              color: 'hsl(var(--step-text-main))',
            }}
            labelStyle={{ color: 'hsl(var(--step-text-main))' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#16a34a" 
            strokeWidth={2}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
        </ResponsiveContainer>
      </div>
      
      {legend && (
        <div className="mt-4 pt-4 border-t border-step-border dark:border-step-dark-border">
          <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted">
            {legend}
          </p>
        </div>
      )}
    </div>
  );
};

