import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted uppercase tracking-wide mb-1">
          {label}
        </label>
      )}
      <select
        className={`worksheet-select w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-step-primary-500 focus:border-transparent text-sm md:text-[15px] text-step-text-main dark:text-step-dark-text-main bg-step-surface dark:bg-step-dark-surface border-step-border dark:border-step-dark-border transition-colors duration-200 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main">
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

