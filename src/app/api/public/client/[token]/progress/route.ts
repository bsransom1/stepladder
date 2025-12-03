import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateMagicLink } from '@/lib/magic-link';
import { subDays } from 'date-fns';

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

  // Get progress for last 7 days
  const weekAgo = subDays(new Date(), 7).toISOString();
  const { data: runs } = await db
    .from('erp_exposure_runs')
    .select('suds_before, suds_after')
    .eq('client_id', clientInfo.clientId)
    .gte('date_time', weekAgo);

  const exposures_completed_last_7_days = runs?.length || 0;
  const avg_suds_before = runs?.length
    ? runs.reduce((sum, r) => sum + r.suds_before, 0) / runs.length
    : 0;
  const avg_suds_after = runs?.length
    ? runs.reduce((sum, r) => sum + r.suds_after, 0) / runs.length
    : 0;

  return NextResponse.json({
    erp: {
      exposures_completed_last_7_days,
      avg_suds_before: Math.round(avg_suds_before),
      avg_suds_after: Math.round(avg_suds_after),
    },
  });
}

