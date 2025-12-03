'use client';

import React from 'react';
import { Button } from '../Button';
import { WorksheetDefinition } from '@/config/worksheetDefinitions';

interface WorksheetCardProps {
  definition: WorksheetDefinition;
  items?: any[];
  onAddItem?: () => void;
  emptyStateText?: string;
  renderItem?: (item: any, index: number) => React.ReactNode;
  showAddForm?: boolean;
  onToggleAddForm?: () => void;
  addFormContent?: React.ReactNode;
}

export const WorksheetCard: React.FC<WorksheetCardProps> = ({
  definition,
  items = [],
  onAddItem,
  emptyStateText,
  renderItem,
  showAddForm = false,
  onToggleAddForm,
  addFormContent,
}) => {
  const displayItems = items || [];
  const hasItems = displayItems.length > 0;
  const defaultEmptyText = `No ${definition.itemLabel?.toLowerCase() || 'items'} yet. Use '${definition.addButtonLabel || 'Add'}' to create the first item.`;

  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-colors duration-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">{definition.title}</h3>
          {definition.description && (
            <p className="text-sm md:text-[15px] text-muted-foreground mt-1">{definition.description}</p>
          )}
        </div>
        {onAddItem && !showAddForm && (
          <Button size="sm" onClick={onToggleAddForm || onAddItem}>
            {definition.addButtonLabel || 'Add'}
          </Button>
        )}
      </div>

      {showAddForm && addFormContent && (
        <div className="bg-muted border border-border rounded-lg p-4 mb-6 transition-colors duration-200">
          {addFormContent}
        </div>
      )}

      {!hasItems ? (
        <div className="py-12 text-center">
          <p className="font-semibold text-foreground mb-2">
            No {definition.itemLabel?.toLowerCase() || 'items'} yet
          </p>
          <p className="text-sm md:text-[15px] text-muted-foreground">
            {emptyStateText || defaultEmptyText}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item, index) => (
            <div key={item.id || index}>
              {renderItem ? (
                renderItem(item, index)
              ) : (
                <div className="border border-border rounded-lg p-4 bg-muted transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <span className="text-lg font-semibold text-muted-foreground min-w-[2rem]">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2">
                        {item.label || item.title || `Item ${index + 1}`}
                      </h4>
                      {item.description && (
                        <p className="text-sm md:text-[15px] text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

