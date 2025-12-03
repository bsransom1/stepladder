/**
 * Worksheet Registry - Phase 2 (Part 1)
 * 
 * Central registry for all worksheet templates organized by modality.
 * 
 * Status: CBT worksheets implemented. Other modalities (ERP, DBT, CBT-J, SUD) 
 * are stubs and will be filled in later Phase 2 steps.
 * 
 * DO NOT populate non-CBT modalities yet in this commit. That will be handled 
 * in later Phase 2 steps.
 */

import { cbtWorksheets } from './cbt';
import { erpWorksheets } from './erp';
import { dbtWorksheets } from './dbt';
import { cbtjWorksheets } from './cbtj';
import { sudWorksheets } from './sud';
import type { WorksheetTemplate } from '@/lib/types/worksheet';

/**
 * All worksheets from all modalities combined
 */
export const allWorksheets: WorksheetTemplate[] = [
  ...cbtWorksheets,
  ...erpWorksheets,
  ...dbtWorksheets,
  ...cbtjWorksheets,
  ...sudWorksheets,
];

/**
 * Worksheets organized by modality
 */
export const worksheetsByModality: Record<string, WorksheetTemplate[]> = {
  CBT: cbtWorksheets,
  ERP: erpWorksheets,
  DBT: dbtWorksheets,
  'CBT-J': cbtjWorksheets,
  SUD: sudWorksheets,
};

/**
 * Get worksheets by modality
 */
export function getWorksheetsByModality(modality: string): WorksheetTemplate[] {
  return worksheetsByModality[modality] || [];
}

/**
 * Get worksheet by ID
 */
export function getWorksheetById(id: string): WorksheetTemplate | undefined {
  return allWorksheets.find(worksheet => worksheet.id === id);
}

/**
 * Get all unique problem domains from all worksheets
 */
export function getAllProblemDomains(): string[] {
  const domains = new Set<string>();
  allWorksheets.forEach(worksheet => {
    worksheet.problemDomains.forEach(domain => domains.add(domain));
  });
  return Array.from(domains).sort();
}

/**
 * Filter worksheets based on modality, problem domains, and search term
 */
export function filterWorksheets(
  worksheets: WorksheetTemplate[],
  modality: string | null,
  selectedDomains: string[],
  searchTerm: string
): WorksheetTemplate[] {
  let filtered = worksheets;

  // Filter by modality
  if (modality && modality !== 'All') {
    filtered = filtered.filter(w => w.modality === modality);
  }

  // Filter by problem domains
  if (selectedDomains.length > 0) {
    filtered = filtered.filter(w =>
      w.problemDomains.some(domain => selectedDomains.includes(domain))
    );
  }

  // Filter by search term
  if (searchTerm.trim()) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(w =>
      w.title.toLowerCase().includes(searchLower) ||
      w.description?.toLowerCase().includes(searchLower) ||
      w.modules.some(m => m.toLowerCase().includes(searchLower)) ||
      w.problemDomains.some(d => d.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

