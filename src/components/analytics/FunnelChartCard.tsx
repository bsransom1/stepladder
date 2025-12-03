'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { FunnelDatum } from '@/lib/mockAnalytics';

interface FunnelChartCardProps {
  title: string;
  data: FunnelDatum[];
}

export const FunnelChartCard: React.FC<FunnelChartCardProps> = ({
  title,
  data,
}) => {
  const chartData = data.map((item) => ({
    modality: item.modality,
    Assigned: item.assigned,
    Started: item.started,
    Completed: item.completed,
  }));

  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
        {title}
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-30" />
          <XAxis 
            dataKey="modality" 
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
          <Legend />
          <Bar dataKey="Assigned" fill="#94a3b8" />
          <Bar dataKey="Started" fill="#64748b" />
          <Bar dataKey="Completed" fill="#16a34a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

