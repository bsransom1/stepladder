import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-colors duration-200">
      <p className="text-label mb-2">{title}</p>
      <p className="text-heading-xl font-semibold text-foreground">{value}</p>
      {subtitle && (
        <p className="text-body-sm text-muted-foreground mt-2">{subtitle}</p>
      )}
    </div>
  );
};

