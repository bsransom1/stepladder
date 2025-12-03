'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { getAuthHeaders } from '@/lib/auth-client';
import { ERPHierarchyItem } from '@/types';

interface HierarchyBuilderProps {
  clientId: string;
  items: ERPHierarchyItem[];
  onUpdate: () => void;
}

export const HierarchyBuilder: React.FC<HierarchyBuilderProps> = ({
  clientId,
  items,
  onUpdate,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    label: '',
    baseline_suds: 50,
    category: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddItem = async () => {
    if (!newItem.label.trim()) {
      setError('Label is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/clients/${clientId}/erp/hierarchy-items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          items: [newItem],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to add hierarchy item');
        setLoading(false);
        return;
      }

      setNewItem({ label: '', baseline_suds: 50, category: '', description: '' });
      setShowAddForm(false);
      onUpdate();
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<ERPHierarchyItem>) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/erp/hierarchy-items/${itemId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  return (
    <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-step-text-main dark:text-step-dark-text-main">Exposure Hierarchy</h3>
        {!showAddForm && (
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            Add Step
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-step-bg dark:bg-step-dark-bg border border-step-border dark:border-step-dark-border rounded-lg p-4 mb-4 transition-colors duration-200">
          {error && (
            <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30 text-step-status-danger-text dark:text-step-status-danger-textDark px-4 py-2 rounded mb-4 transition-colors duration-200">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label"
              value={newItem.label}
              onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
              placeholder="e.g., Touch bathroom doorknob"
            />
            <Input
              label="Baseline SUDS (0-100)"
              type="number"
              min="0"
              max="100"
              value={newItem.baseline_suds}
              onChange={(e) => setNewItem({ ...newItem, baseline_suds: parseInt(e.target.value) || 50 })}
            />
            <Input
              label="Category (optional)"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              placeholder="e.g., Contamination"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={handleAddItem} disabled={loading}>
              {loading ? 'Adding...' : 'Add Step'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted text-center py-8">No hierarchy items yet. Add your first step above.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-step-bg dark:bg-step-dark-bg rounded-lg border border-step-border dark:border-step-dark-border transition-colors duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm md:text-[15px] font-medium text-step-text-muted dark:text-step-dark-text-muted">#{index + 1}</span>
                  <span className="font-semibold text-step-text-main dark:text-step-dark-text-main">{item.label}</span>
                  {item.category && (
                    <span className="text-xs px-2 py-1 bg-step-border dark:bg-step-dark-border rounded text-step-text-muted dark:text-step-dark-text-muted transition-colors duration-200">
                      {item.category}
                    </span>
                  )}
                  <span className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted">
                    SUDS: {item.baseline_suds}
                    {item.metrics && (
                      <span className="ml-2">
                        (Current: {item.metrics.avg_suds_before} → {item.metrics.avg_suds_after})
                      </span>
                    )}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm md:text-[15px] text-step-text-muted dark:text-step-dark-text-muted mt-1 ml-8">{item.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateItem(item.id, { is_active: !item.is_active })}
                  className={`text-xs px-2 py-1 rounded font-medium transition-colors duration-200 ${
                    item.is_active
                      ? 'bg-step-status-success-bg dark:bg-step-status-success-bgDark text-step-status-success-text dark:text-step-status-success-textDark'
                      : 'bg-step-border dark:bg-step-dark-border text-step-text-muted dark:text-step-dark-text-muted'
                  }`}
                >
                  {item.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

