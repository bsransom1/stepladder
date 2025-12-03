'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ModalityShare } from '@/lib/mockAnalytics';

interface DonutChartCardProps {
  title: string;
  data: ModalityShare[];
  subtext?: string;
}

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export const DonutChartCard: React.FC<DonutChartCardProps> = ({
  title,
  data,
  subtext,
}) => {
  const total = data.reduce((sum, item) => sum + item.entries, 0);
  
  const chartData = data.map((item) => ({
    name: item.modality,
    value: item.entries,
    percentage: ((item.entries / total) * 100).toFixed(1),
  }));

  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
      <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-1">
        {title}
      </h3>
      {subtext && (
        <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted mb-4">
          {subtext}
        </p>
      )}
      
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--step-surface))',
              border: '1px solid hsl(var(--step-border))',
              borderRadius: '8px',
              color: 'hsl(var(--step-text-main))',
            }}
            labelStyle={{ color: 'hsl(var(--step-text-main))' }}
            formatter={(value: number) => [value, 'Entries']}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: 'hsl(var(--step-text-main))', fontSize: '12px' }}
            formatter={(value, entry: any) => `${value}: ${entry.payload.percentage}%`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

