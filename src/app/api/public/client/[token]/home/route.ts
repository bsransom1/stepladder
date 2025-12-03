import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateMagicLink } from '@/lib/magic-link';
import { format, isSameDay, parseISO, getDay } from 'date-fns';
import { subDays } from 'date-fns';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  // Validate magic link
  const clientInfo = await validateMagicLink(token);
  if (!clientInfo) {
    return NextResponse.json(
      { error: 'Invalid or expired link' },
      { status: 401 }
    );
  }

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayDayOfWeek = DAYS_OF_WEEK[getDay(today)];

  // Get active assignments
  const { data: assignments } = await db
    .from('assignments')
    .select('*')
    .eq('client_id', clientInfo.clientId)
    .eq('is_active', true)
    .eq('modality', 'ERP')
    .eq('worksheet_type', 'erp_exposure_run');

  // Build tasks for today
  const tasks = await Promise.all(
    (assignments || []).map(async (assignment) => {
      const config = assignment.config as any;
      const daysOfWeek = config.days_of_week || [];
      
      // Check if assignment is active today
      if (daysOfWeek.length > 0 && !daysOfWeek.includes(todayDayOfWeek)) {
        return null;
      }

      // Get hierarchy item label and ID
      const { data: hierarchyItem } = await db
        .from('erp_hierarchy_items')
        .select('id, label')
        .eq('id', config.hierarchy_item_id)
        .single();

      // Count runs today
      const startOfToday = format(today, 'yyyy-MM-dd');
      const { count: runsToday } = await db
        .from('erp_exposure_runs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientInfo.clientId)
        .eq('assignment_id', assignment.id)
        .gte('date_time', `${startOfToday}T00:00:00`)
        .lt('date_time', `${startOfToday}T23:59:59`);

      const totalRunsToday = config.frequency_per_day || 1;
      const remainingRunsToday = Math.max(0, totalRunsToday - (runsToday || 0));

      if (remainingRunsToday === 0) {
        return null; // All runs completed today
      }

      return {
        assignment_id: assignment.id,
        modality: assignment.modality,
        goal: assignment.goal,
        type: assignment.worksheet_type,
        hierarchy_item_id: config.hierarchy_item_id,
        label: hierarchyItem?.label || 'Exposure',
        remaining_runs_today: remainingRunsToday,
        total_runs_today: totalRunsToday,
        instructions: config.instructions || '',
      };
    })
  );

  const activeTasks = tasks.filter((t) => t !== null) as any[];

  // Get progress snippet (last 7 days)
  const weekAgo = subDays(today, 7).toISOString();
  const { data: runs } = await db
    .from('erp_exposure_runs')
    .select('suds_before, suds_after')
    .eq('client_id', clientInfo.clientId)
    .gte('date_time', weekAgo);

  const exposures_completed_last_7_days = runs?.length || 0;
  const avg_suds_drop = runs?.length
    ? runs.reduce((sum, r) => sum + (r.suds_before - r.suds_after), 0) / runs.length
    : 0;

  return NextResponse.json({
    client: {
      display_name: clientInfo.displayName,
    },
    today: todayStr,
    tasks: activeTasks,
    progress_snippet: {
      avg_suds_drop_last_7_days: Math.round(avg_suds_drop),
      exposures_completed_last_7_days,
    },
  });
}

