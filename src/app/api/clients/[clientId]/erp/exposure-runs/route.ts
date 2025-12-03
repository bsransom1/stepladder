import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../../middleware';
import { subDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'last_30_days';

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

  const daysAgo = range === 'last_7_days' ? 7 : 30;
  const startDate = subDays(new Date(), daysAgo).toISOString();

  const { data: runs, error } = await db
    .from('erp_exposure_runs')
    .select(`
      *,
      erp_hierarchy_items!inner(label)
    `)
    .eq('client_id', clientId)
    .gte('date_time', startDate)
    .order('date_time', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch exposure runs' },
      { status: 500 }
    );
  }

  // Transform to include hierarchy label
  const transformedRuns = runs?.map((run: any) => ({
    ...run,
    hierarchy_label: run.erp_hierarchy_items?.label,
  })) || [];

  return NextResponse.json(transformedRuns);
}

