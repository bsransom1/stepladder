'use client';

import { useState, useMemo } from 'react';
import { TherapistLayout } from '@/components/TherapistLayout';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { WorksheetForm } from '@/components/worksheets/WorksheetForm';
import { 
  allWorksheets, 
  worksheetsByModality,
  getAllProblemDomains,
  filterWorksheets,
} from '@/data/worksheets';
import type { WorksheetTemplate } from '@/lib/types/worksheet';
import { HiSearch, HiX } from 'react-icons/hi';

export default function WorksheetsPage() {
  const [selectedModality, setSelectedModality] = useState<string>('All');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorksheet, setSelectedWorksheet] = useState<WorksheetTemplate | null>(null);

  const allDomains = useMemo(() => getAllProblemDomains(), []);

  const filteredWorksheets = useMemo(() => {
    return filterWorksheets(
      allWorksheets,
      selectedModality,
      selectedDomains,
      searchTerm
    );
  }, [selectedModality, selectedDomains, searchTerm]);

  const modalities = ['All', ...Object.keys(worksheetsByModality)];

  const toggleDomain = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const clearFilters = () => {
    setSelectedModality('All');
    setSelectedDomains([]);
    setSearchTerm('');
  };

  const handlePreviewSubmit = (values: Record<string, any>) => {
    console.log('Preview submit', selectedWorksheet?.id, values);
    // Show a simple message - no data persistence in Phase 3
    alert('Preview submitted (no data saved). This is a preview only.');
  };

  return (
    <TherapistLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display mb-2">Worksheet Library</h1>
          <p className="text-body text-muted-foreground">
            Browse science-based worksheets by modality and problem domain.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Modality Tabs */}
          <div className="flex flex-wrap gap-2">
            {modalities.map(modality => (
              <button
                key={modality}
                onClick={() => setSelectedModality(modality)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedModality === modality
                    ? 'bg-step-primary-500 text-white'
                    : 'bg-card text-foreground border border-border hover:bg-muted'
                }`}
              >
                {modality} {modality !== 'All' && `(${worksheetsByModality[modality]?.length || 0})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search worksheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <HiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Problem Domain Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">Problem Domains:</span>
            {allDomains.map(domain => (
              <button
                key={domain}
                onClick={() => toggleDomain(domain)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedDomains.includes(domain)
                    ? 'bg-step-primary-500 text-white'
                    : 'bg-card text-foreground border border-border hover:bg-muted'
                }`}
              >
                {domain}
              </button>
            ))}
            {(selectedDomains.length > 0 || selectedModality !== 'All' || searchTerm) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="ml-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredWorksheets.length} of {allWorksheets.length} worksheets
          </p>
        </div>

        {/* Worksheet Cards */}
        {filteredWorksheets.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-body text-muted-foreground mb-2">
              No worksheets found matching your filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorksheets.map(worksheet => (
              <div
                key={worksheet.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-heading-md font-semibold text-foreground">
                      {worksheet.title}
                    </h3>
                    <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-step-primary-500/15 text-step-primary-300">
                      {worksheet.modality}
                    </span>
                  </div>
                  
                  {worksheet.description && (
                    <p className="text-body-sm text-muted-foreground line-clamp-2 mb-3">
                      {worksheet.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {/* Modules */}
                  {worksheet.modules.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Modules:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {worksheet.modules.map(module => (
                          <span
                            key={module}
                            className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                          >
                            {module}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Problem Domains */}
                  {worksheet.problemDomains.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Domains:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {worksheet.problemDomains.map(domain => (
                          <span
                            key={domain}
                            className="px-2 py-0.5 rounded text-xs bg-step-primary-500/10 text-step-primary-400 border border-step-primary-500/20"
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evidence Tag */}
                  {worksheet.evidenceTag && (
                    <div>
                      <span className="text-xs text-muted-foreground italic">
                        {worksheet.evidenceTag}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedWorksheet(worksheet)}
                  className="w-full"
                >
                  Preview
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        {selectedWorksheet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-colors duration-200">
            <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-heading-xl mb-2">{selectedWorksheet.title}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-step-primary-500/15 text-step-primary-300">
                        {selectedWorksheet.modality}
                      </span>
                      {selectedWorksheet.problemDomains.map(domain => (
                        <span
                          key={domain}
                          className="px-2 py-1 rounded text-xs bg-step-primary-500/10 text-step-primary-400 border border-step-primary-500/20"
                        >
                          {domain}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedWorksheet(null)}>
                    Close
                  </Button>
                </div>

                {/* Preview Notice */}
                <div className="bg-step-status-info-bg dark:bg-step-status-info-bgDark border border-step-status-info-text/20 dark:border-step-status-info-textDark/30 text-step-status-info-text dark:text-step-status-info-textDark px-4 py-3 rounded-lg mb-6 transition-colors duration-200">
                  <p className="text-body-sm">
                    <strong>Preview Mode:</strong> This is a preview only. Client assignments will be available in a later update.
                  </p>
                </div>

                {/* Worksheet Form */}
                <div className="bg-muted/30 rounded-lg p-6">
                  <WorksheetForm
                    template={selectedWorksheet}
                    onSubmit={handlePreviewSubmit}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TherapistLayout>
  );
}

