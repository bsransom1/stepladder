'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { RiskSnapshot } from '@/lib/mockAnalytics';

interface RiskCardProps {
  data: RiskSnapshot;
}

export const RiskCard: React.FC<RiskCardProps> = ({ data }) => {
  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
        Risk & safety signals
      </h3>
      
      <div className="space-y-4 mb-4 flex-1">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-step-status-danger-text dark:text-step-status-danger-textDark">
              {data.elevatedClients}
            </span>
            <span className="text-sm text-step-text-muted dark:text-step-dark-text-muted">
              / {data.totalClients} clients
            </span>
          </div>
          <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted mt-1">
            Clients with elevated risk in range
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xl font-semibold text-step-status-danger-text dark:text-step-status-danger-textDark">
              {data.newCrisisFlags}
            </div>
            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mt-1">
              New crisis flags
            </p>
          </div>
          <div>
            <div className="text-xl font-semibold text-step-status-success-text dark:text-step-status-success-textDark">
              {data.resolvedFlags}
            </div>
            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mt-1">
              Resolved flags
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-step-border dark:border-step-dark-border">
        <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
          Elevated-risk entries per week
        </p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={data.trend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              hide
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--step-surface))',
                border: '1px solid hsl(var(--step-border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--step-text-main))',
              }}
              labelStyle={{ color: 'hsl(var(--step-text-main))' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

