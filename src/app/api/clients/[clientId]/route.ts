import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../middleware';
import { subDays } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;

  // Verify client belongs to therapist
  const { data: client, error: clientError } = await db
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('therapist_id', auth.therapist.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    );
  }

  // Get active magic link
  const { data: magicLink } = await db
    .from('client_magic_links')
    .select('token, url')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get active assignments
  const { data: assignments } = await db
    .from('assignments')
    .select('*')
    .eq('client_id', clientId)
    .eq('is_active', true);

  // Get metrics for last 7 days
  const weekAgo = subDays(new Date(), 7).toISOString();

  const { data: runs } = await db
    .from('erp_exposure_runs')
    .select('suds_before, suds_after, did_ritual')
    .eq('client_id', clientId)
    .gte('date_time', weekAgo);

  const exposures_completed_last_7_days = runs?.length || 0;
  const avg_suds_before = runs?.length
    ? runs.reduce((sum, r) => sum + r.suds_before, 0) / runs.length
    : 0;
  const avg_suds_after = runs?.length
    ? runs.reduce((sum, r) => sum + r.suds_after, 0) / runs.length
    : 0;
  const runs_with_rituals = runs?.filter((r) => r.did_ritual).length || 0;

  return NextResponse.json({
    ...client,
    magic_link: magicLink || null,
    active_assignments: assignments || [],
    metrics: {
      exposures_completed_last_7_days,
      avg_suds_before: Math.round(avg_suds_before),
      avg_suds_after: Math.round(avg_suds_after),
      runs_with_rituals,
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;

  // Verify client belongs to therapist
  const { data: client, error: clientError } = await db
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('therapist_id', auth.therapist.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    );
  }

  // Delete the client - all related data will be cascade deleted due to foreign key constraints
  const { error: deleteError } = await db
    .from('clients')
    .delete()
    .eq('id', clientId)
    .eq('therapist_id', auth.therapist.id);

  if (deleteError) {
    console.error('Failed to delete client:', deleteError);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

