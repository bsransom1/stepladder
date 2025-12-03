'use client';

import React from 'react';
import { Button } from './Button';

interface EmailWorksheetDialogProps {
  isOpen: boolean;
  clientName: string;
  clientEmail: string;
  worksheetTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const EmailWorksheetDialog: React.FC<EmailWorksheetDialogProps> = ({
  isOpen,
  clientName,
  clientEmail,
  worksheetTitle,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-colors duration-200">
      <div className="bg-card rounded-lg max-w-md w-full transition-colors duration-200">
        <div className="p-6">
          <h2 className="text-heading-xl mb-4">Email worksheet to client?</h2>
          
          <p className="text-body text-foreground mb-4">
            We'll send this completed worksheet to <strong>{clientName}</strong> at{' '}
            <strong>{clientEmail}</strong>.
          </p>
          
          <div className="bg-step-status-warning-bg dark:bg-step-status-warning-bgDark border border-step-status-warning-text/20 dark:border-step-status-warning-textDark/30 text-step-status-warning-text dark:text-step-status-warning-textDark px-4 py-3 rounded-lg mb-6 transition-colors duration-200">
            <p className="text-body-sm">
              <strong>Privacy Notice:</strong> This email may contain sensitive health information. Please ensure the client's email address is correct.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={onConfirm} 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

