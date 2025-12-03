'use client';

import { TherapistLayout } from '@/components/TherapistLayout';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsPage() {
  return (
    <TherapistLayout>
      <div className="p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-step-text-main dark:text-step-dark-text-main tracking-tight mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6">
            <h2 className="text-lg md:text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">Appearance</h2>
            <p className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted mb-4">
              Choose your preferred theme
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </TherapistLayout>
  );
}

