'use client';

import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-step-status-success-bg dark:bg-step-status-success-bgDark',
    error: 'bg-step-status-danger-bg dark:bg-step-status-danger-bgDark',
    info: 'bg-step-status-info-bg dark:bg-step-status-info-bgDark',
  }[type];

  const borderColor = {
    success: 'border-step-status-success-text/20 dark:border-step-status-success-textDark/30',
    error: 'border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30',
    info: 'border-step-status-info-text/20 dark:border-step-status-info-textDark/30',
  }[type];

  const textColor = {
    success: 'text-step-status-success-text dark:text-step-status-success-textDark',
    error: 'text-step-status-danger-text dark:text-step-status-danger-textDark',
    info: 'text-step-status-info-text dark:text-step-status-info-textDark',
  }[type];

  return (
    <div
      className={`${bgColor} ${borderColor} ${textColor} border rounded-lg px-4 py-3 shadow-lg flex items-center justify-between gap-4 min-w-[300px] max-w-md transition-all duration-200`}
    >
      <p className="text-body-sm flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <HiX className="w-5 h-5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
};

