'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
  tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  subtext,
  tooltip,
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-step-status-success-text dark:text-step-status-success-textDark';
    if (trend === 'down') return 'text-step-status-danger-text dark:text-step-status-danger-textDark';
    return 'text-step-text-muted dark:text-step-dark-text-muted';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '▲';
    if (trend === 'down') return '▼';
    return '';
  };

  return (
    <div 
      className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200 hover:bg-step-bg dark:hover:bg-step-dark-bg"
      title={tooltip}
    >
      <h3 className="text-sm font-medium text-step-text-muted dark:text-step-dark-text-muted uppercase tracking-wide mb-2">
        {title}
      </h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-semibold text-step-text-main dark:text-step-dark-text-main">
          {value}
        </span>
        {change !== undefined && trend && (
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {getTrendIcon()} {Math.abs(change)}%
          </span>
        )}
      </div>
      {subtext && (
        <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted">
          {subtext}
        </p>
      )}
    </div>
  );
};

