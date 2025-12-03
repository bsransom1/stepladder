import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../middleware';
import { subDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'last_7_days';

  // Verify client belongs to therapist
  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('therapist_id', auth.therapist.id)
    .single();

  if (!client) {
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    );
  }

  const daysAgo = range === 'last_30_days' ? 30 : 7;
  const startDate = subDays(new Date(), daysAgo).toISOString();

  // Get exposure runs
  const { data: runs } = await db
    .from('erp_exposure_runs')
    .select('suds_before, suds_after, did_ritual')
    .eq('client_id', clientId)
    .gte('date_time', startDate);

  // Get active assignments
  const { data: assignments } = await db
    .from('assignments')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .eq('modality', 'ERP')
    .eq('worksheet_type', 'erp_exposure_run');

  const exposures_completed = runs?.length || 0;
  const exposures_assigned = assignments?.length || 0;
  const avg_suds_before = runs?.length
    ? runs.reduce((sum, r) => sum + r.suds_before, 0) / runs.length
    : 0;
  const avg_suds_after = runs?.length
    ? runs.reduce((sum, r) => sum + r.suds_after, 0) / runs.length
    : 0;
  const runs_with_rituals = runs?.filter((r) => r.did_ritual).length || 0;

  return NextResponse.json({
    range,
    erp: {
      exposures_completed,
      exposures_assigned,
      avg_suds_before: Math.round(avg_suds_before),
      avg_suds_after: Math.round(avg_suds_after),
      runs_with_rituals,
    },
  });
}

