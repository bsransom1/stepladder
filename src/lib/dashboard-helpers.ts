import { Client, Assignment } from '@/types';
import { subDays } from 'date-fns';

export interface AttentionItem {
  clientId: string;
  displayName: string;
  reason: string;
  status: 'Low completion' | 'High risk' | 'No activity';
}

export interface ActiveHomeworkItem {
  clientId: string;
  clientName: string;
  assignmentId: string;
  worksheetType: string;
  worksheetTitle: string;
  modality: string;
  status: 'On track' | 'Low completion' | 'High risk' | 'Paused';
  lastEntry: string | null;
}

/**
 * Compute attention items for clients that need therapist attention
 */
export function computeAttentionItems(
  clients: Array<Client & {
    exposures_completed_this_week?: number;
    exposures_assigned_this_week?: number;
    last_activity_at?: string | null;
  }>
): AttentionItem[] {
  const attentionItems: AttentionItem[] = [];
  const weekAgo = subDays(new Date(), 7).toISOString();

  clients.forEach((client) => {
    const completed = client.exposures_completed_this_week || 0;
    const assigned = client.exposures_assigned_this_week || 0;
    const lastActivity = client.last_activity_at;
    const hasRecentActivity = lastActivity && new Date(lastActivity) >= new Date(weekAgo);

    // No activity in last 7 days
    if (assigned > 0 && !hasRecentActivity) {
      attentionItems.push({
        clientId: client.id,
        displayName: client.display_name,
        reason: 'No homework entries in the last 7 days',
        status: 'No activity',
      });
      return;
    }

    // Low completion rate
    if (assigned > 0 && completed > 0) {
      const completionRate = (completed / assigned) * 100;
      if (completionRate < 30) {
        attentionItems.push({
          clientId: client.id,
          displayName: client.display_name,
          reason: `Completed < 30% of assigned tasks this week`,
          status: 'Low completion',
        });
        return;
      }
    }

    // TODO: Add high risk detection when we have more data sources
    // For now, we'll rely on the status from assignments/entries
  });

  return attentionItems.slice(0, 5); // Limit to top 5
}

/**
 * Compute active homework items with status
 */
export function computeActiveHomework(
  assignments: Array<Assignment & {
    client?: Client;
    lastEntryDate?: string | null;
    completionRate?: number;
    hasRiskFlags?: boolean;
  }>,
  worksheetTitles: Record<string, string>
): ActiveHomeworkItem[] {
  return assignments.map((assignment) => {
    const completionRate = assignment.completionRate || 0;
    let status: 'On track' | 'Low completion' | 'High risk' | 'Paused' = 'On track';

    if (!assignment.is_active) {
      status = 'Paused';
    } else if (assignment.hasRiskFlags) {
      status = 'High risk';
    } else if (completionRate < 70) {
      status = 'Low completion';
    }

    const lastEntry = assignment.lastEntryDate
      ? formatRelativeTime(new Date(assignment.lastEntryDate))
      : null;

    return {
      clientId: assignment.client_id,
      clientName: assignment.client?.display_name || 'Unknown',
      assignmentId: assignment.id,
      worksheetType: assignment.worksheet_type,
      worksheetTitle: worksheetTitles[assignment.worksheet_type] || assignment.worksheet_type,
      modality: assignment.modality,
      status,
      lastEntry,
    };
  });
}

/**
 * Format date as relative time (e.g., "2 days ago", "Today, 9:14 AM")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day - show time
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

