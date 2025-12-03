import { Assignment } from '@/types';
import { WorksheetType, WORKSHEET_DEFINITIONS } from '@/config/worksheetDefinitions';
import { ERPExposureRun } from '@/types';
import { subDays } from 'date-fns';

/**
 * Get active worksheet types from assignments
 */
export function getActiveWorksheetTypes(assignments: Assignment[]): WorksheetType[] {
  const activeAssignments = assignments.filter(a => a.is_active);
  const worksheetTypes = new Set<WorksheetType>();
  
  activeAssignments.forEach(assignment => {
    // Map worksheet_type string to WorksheetType
    const type = assignment.worksheet_type as WorksheetType;
    if (type && WORKSHEET_DEFINITIONS[type]) {
      worksheetTypes.add(type);
    }
  });
  
  return Array.from(worksheetTypes);
}

/**
 * Filter assignments by worksheet type
 */
export function getAssignmentsForWorksheetType(
  assignments: Assignment[],
  worksheetType: WorksheetType
): Assignment[] {
  return assignments.filter(
    a => a.is_active && (a.worksheet_type as WorksheetType) === worksheetType
  );
}

/**
 * Compute metrics for a worksheet type based on entries and assignments
 */
export function computeMetricsForWorksheetType(
  worksheetType: WorksheetType,
  entries: any[],
  assignments: Assignment[],
  clientMetrics?: any
): Record<string, any> {
  const definition = WORKSHEET_DEFINITIONS[worksheetType];
  const metrics: Record<string, any> = {};
  
  if (!definition.analytics) {
    return metrics;
  }

  const weekAgo = subDays(new Date(), 7).toISOString();
  const recentEntries = entries.filter((e: any) => 
    new Date(e.date_time || e.created_at || e.date).toISOString() >= weekAgo
  );

  // Process each KPI definition
  definition.analytics.kpis.forEach(kpi => {
    switch (worksheetType) {
      case 'erp_exposure_run':
        switch (kpi.valueKey) {
          case 'exposuresLast7Days':
            const activeAssignments = assignments.filter(a => a.is_active);
            const assigned = activeAssignments.length * 7;
            metrics[kpi.valueKey] = {
              completed: recentEntries.length,
              assigned: assigned,
            };
            break;
          case 'avgSudsBeforeAfter':
            if (recentEntries.length > 0) {
              const avgBefore = recentEntries.reduce((sum: number, e: ERPExposureRun) => sum + e.suds_before, 0) / recentEntries.length;
              const avgAfter = recentEntries.reduce((sum: number, e: ERPExposureRun) => sum + e.suds_after, 0) / recentEntries.length;
              metrics[kpi.valueKey] = {
                before: Math.round(avgBefore),
                after: Math.round(avgAfter),
              };
            } else {
              metrics[kpi.valueKey] = { before: 0, after: 0 };
            }
            break;
          case 'ritualsLogged':
            metrics[kpi.valueKey] = recentEntries.filter((e: ERPExposureRun) => e.did_ritual).length;
            break;
        }
        break;
      
      // Stub implementations for other worksheet types
      case 'cbt_thought_record':
      case 'dbt_diary_card':
      case 'sleep_diary':
      case 'sud_craving_log':
        // For now, return placeholder values
        if (kpi.valueKey.includes('Last7Days')) {
          metrics[kpi.valueKey] = {
            completed: recentEntries.length,
            assigned: assignments.filter(a => a.is_active).length * 7,
          };
        } else {
          metrics[kpi.valueKey] = 0;
        }
        break;
    }
  });

  // Add summary if applicable
  if (worksheetType === 'erp_exposure_run' && recentEntries.length > 0) {
    const recentRuns = recentEntries.slice(0, 10);
    const avgDrop = Math.round(
      recentRuns.reduce((sum: number, r: ERPExposureRun) => sum + (r.suds_before - r.suds_after), 0) / recentRuns.length
    );
    metrics['sudsDropSummary'] = `Average SUDS drop: ${avgDrop} points over last ${recentRuns.length} runs`;
  }

  return metrics;
}

/**
 * Get items for a worksheet type (e.g., hierarchy items for ERP)
 */
export async function getItemsForWorksheetType(
  clientId: string,
  worksheetType: WorksheetType,
  getAuthHeaders: () => HeadersInit
): Promise<any[]> {
  switch (worksheetType) {
    case 'erp_exposure_hierarchy':
      try {
        const response = await fetch(`/api/clients/${clientId}/erp/hierarchy-items`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          return data || [];
        }
      } catch (error) {
        console.error('Failed to fetch hierarchy items:', error);
      }
      return [];
    
    // Other worksheet types would fetch their respective items here
    default:
      return [];
  }
}

/**
 * Get entries for a worksheet type
 */
export async function getEntriesForWorksheetType(
  clientId: string,
  worksheetType: WorksheetType,
  getAuthHeaders: () => HeadersInit
): Promise<any[]> {
  switch (worksheetType) {
    case 'erp_exposure_run':
      try {
        const response = await fetch(`/api/clients/${clientId}/erp/exposure-runs?range=last_30_days`, {
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          const data = await response.json();
          return data || [];
        }
      } catch (error) {
        console.error('Failed to fetch exposure runs:', error);
      }
      return [];
    
    // Other worksheet types would fetch their respective entries here
    default:
      return [];
  }
}

