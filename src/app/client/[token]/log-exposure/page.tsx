'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';

export default function LogExposurePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const assignmentId = searchParams.get('assignment_id') || '';

  const [formData, setFormData] = useState({
    suds_before: 50,
    suds_peak: 50,
    suds_after: 50,
    duration_minutes: 10,
    did_ritual: false,
    ritual_description: '',
    notes: '',
  });
  const [hierarchyItemId, setHierarchyItemId] = useState('');
  const [hierarchyLabel, setHierarchyLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch home data to get hierarchy_item_id
    if (assignmentId) {
      fetchHomeData();
    }
  }, [assignmentId, token]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(`/api/public/client/${token}/home`);
      if (!response.ok) return;
      const data = await response.json();
      const task = data.tasks.find((t: any) => t.assignment_id === assignmentId);
      if (task) {
        setHierarchyItemId(task.hierarchy_item_id);
        setHierarchyLabel(task.label);
      }
    } catch (err) {
      console.error('Failed to fetch task data:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!hierarchyItemId || !assignmentId) {
      setError('Missing assignment information. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/public/client/${token}/erp/exposure-runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: assignmentId,
          hierarchy_item_id: hierarchyItemId,
          suds_before: formData.suds_before,
          suds_peak: formData.suds_peak,
          suds_after: formData.suds_after,
          duration_minutes: formData.duration_minutes,
          did_ritual: formData.did_ritual,
          ritual_description: formData.ritual_description || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to log exposure');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/client/${token}`);
      }, 2000);
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-step-bg flex items-center justify-center p-4">
        <div className="bg-step-surface rounded-lg border border-step-border p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">✓</div>
          <h2 className="text-lg md:text-xl font-semibold text-step-text-main mb-2">Logged. Nice work today.</h2>
          <p className="text-sm md:text-[15px] text-step-text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-step-bg pb-8">
      <div className="bg-step-surface border-b border-step-border px-4 py-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-step-text-main tracking-tight">Log Exposure</h1>
        {hierarchyLabel && (
          <p className="text-sm md:text-[15px] text-step-text-muted mt-1">{hierarchyLabel}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {error && (
          <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30 text-step-status-danger-text dark:text-step-status-danger-textDark px-4 py-3 rounded-lg transition-colors duration-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs md:text-sm font-medium text-step-text-main mb-2">
            SUDS Before: {formData.suds_before}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.suds_before}
            onChange={(e) => setFormData({ ...formData, suds_before: parseInt(e.target.value) })}
            className="w-full h-2 bg-step-border rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-step-text-muted mt-1">
            <span>0 (No anxiety)</span>
            <span>100 (Extreme anxiety)</span>
          </div>
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-step-text-main mb-2">
            Peak SUDS: {formData.suds_peak}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.suds_peak}
            onChange={(e) => setFormData({ ...formData, suds_peak: parseInt(e.target.value) })}
            className="w-full h-2 bg-step-border rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-step-text-main mb-2">
            SUDS After: {formData.suds_after}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.suds_after}
            onChange={(e) => setFormData({ ...formData, suds_after: parseInt(e.target.value) })}
            className="w-full h-2 bg-step-border rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <Input
          label="Duration (minutes)"
          type="number"
          min="1"
          value={formData.duration_minutes}
          onChange={(e) =>
            setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 10 })
          }
          required
        />

        <div>
          <label className="block text-xs md:text-sm font-medium text-step-text-main mb-3">
            Did you perform any rituals or safety behaviors?
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, did_ritual: true })}
              className={`flex-1 px-6 py-3 rounded-lg border-2 transition-colors duration-200 text-sm md:text-[15px] ${
                formData.did_ritual
                  ? 'border-step-status-danger-text dark:border-step-status-danger-textDark bg-step-status-danger-bg dark:bg-step-status-danger-bgDark text-step-status-danger-text dark:text-step-status-danger-textDark'
                  : 'border-step-border dark:border-step-dark-border bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, did_ritual: false, ritual_description: '' })}
              className={`flex-1 px-6 py-3 rounded-lg border-2 transition-colors duration-200 text-sm md:text-[15px] ${
                !formData.did_ritual
                  ? 'border-step-status-success-text dark:border-step-status-success-textDark bg-step-status-success-bg dark:bg-step-status-success-bgDark text-step-status-success-text dark:text-step-status-success-textDark'
                  : 'border-step-border dark:border-step-dark-border bg-step-surface dark:bg-step-dark-surface text-step-text-main dark:text-step-dark-text-main'
              }`}
            >
              No
            </button>
          </div>
          {formData.did_ritual && (
            <Textarea
              label="Describe the ritual or safety behavior"
              value={formData.ritual_description}
              onChange={(e) => setFormData({ ...formData, ritual_description: e.target.value })}
              rows={3}
              className="mt-4"
            />
          )}
        </div>

        <Textarea
          label="Notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="What did you notice or learn?"
        />

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Exposure'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-3"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

