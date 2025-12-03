'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { getAuthHeaders } from '@/lib/auth-client';
import { ERPHierarchyItem } from '@/types';

interface AssignmentModalProps {
  clientId: string;
  hierarchyItems: ERPHierarchyItem[];
  onClose: () => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  clientId,
  hierarchyItems,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    hierarchy_item_id: '',
    frequency_per_day: 1,
    days_of_week: [] as string[],
    min_duration_minutes: 10,
    instructions: '',
    reminder_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const daysOptions = [
    { value: 'Mon', label: 'Monday' },
    { value: 'Tue', label: 'Tuesday' },
    { value: 'Wed', label: 'Wednesday' },
    { value: 'Thu', label: 'Thursday' },
    { value: 'Fri', label: 'Friday' },
    { value: 'Sat', label: 'Saturday' },
    { value: 'Sun', label: 'Sunday' },
  ];

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.hierarchy_item_id) {
      setError('Please select a hierarchy item');
      return;
    }

    if (formData.days_of_week.length === 0) {
      setError('Please select at least one day');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          modality: 'ERP',
          goal: 'EXPOSURE_PRACTICE',
          worksheet_type: 'erp_exposure_run',
          config: formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create assignment');
        setLoading(false);
        return;
      }

      onClose();
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  const activeItems = hierarchyItems.filter((item) => item.is_active);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-colors duration-200">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="p-6">
          <h2 className="text-heading-xl mb-6">Assign Homework</h2>

          {error && (
            <div className="bg-step-status-danger-bg dark:bg-red-900/30 border border-step-status-danger-text/20 dark:border-red-500/30 text-step-status-danger-text dark:text-red-400 px-4 py-3 rounded-lg mb-4 transition-colors duration-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Hierarchy Step"
              value={formData.hierarchy_item_id}
              onChange={(e) => setFormData({ ...formData, hierarchy_item_id: e.target.value })}
              options={[
                { value: '', label: 'Select a step...' },
                ...activeItems.map((item) => ({
                  value: item.id,
                  label: `${item.label} (SUDS: ${item.baseline_suds})`,
                })),
              ]}
              required
            />

            <Input
              label="Frequency per Day"
              type="number"
              min="1"
              value={formData.frequency_per_day}
              onChange={(e) =>
                setFormData({ ...formData, frequency_per_day: parseInt(e.target.value) || 1 })
              }
              required
            />

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Days of Week
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOptions.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors text-sm md:text-[15px] ${
                      formData.days_of_week.includes(day.value)
                        ? 'bg-step-primary-500 text-white border-step-primary-500'
                        : 'bg-card text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Minimum Duration (minutes)"
              type="number"
              min="1"
              value={formData.min_duration_minutes}
              onChange={(e) =>
                setFormData({ ...formData, min_duration_minutes: parseInt(e.target.value) || 10 })
              }
              required
            />

            <Textarea
              label="Instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={4}
              placeholder="e.g., Touch bathroom doorknob and delay washing for 30 minutes."
            />

            <Input
              label="Reminder Time (optional)"
              type="time"
              value={formData.reminder_time}
              onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Assignment'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

