import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateMagicLink } from '@/lib/magic-link';
import { z } from 'zod';

const createExposureRunSchema = z.object({
  assignment_id: z.string().uuid(),
  hierarchy_item_id: z.string().uuid(),
  suds_before: z.number().int().min(0).max(100),
  suds_peak: z.number().int().min(0).max(100),
  suds_after: z.number().int().min(0).max(100),
  duration_minutes: z.number().int().min(1),
  did_ritual: z.boolean(),
  ritual_description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(
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

  try {
    const body = await request.json();
    const data = createExposureRunSchema.parse(body);

    // Verify assignment belongs to client
    const { data: assignment } = await db
      .from('assignments')
      .select('id, client_id')
      .eq('id', data.assignment_id)
      .eq('client_id', clientInfo.clientId)
      .single();

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Verify hierarchy item belongs to client
    const { data: hierarchyItem } = await db
      .from('erp_hierarchy_items')
      .select('id, client_id')
      .eq('id', data.hierarchy_item_id)
      .eq('client_id', clientInfo.clientId)
      .single();

    if (!hierarchyItem) {
      return NextResponse.json(
        { error: 'Hierarchy item not found' },
        { status: 404 }
      );
    }

    // Create exposure run
    const { data: exposureRun, error } = await db
      .from('erp_exposure_runs')
      .insert({
        client_id: clientInfo.clientId,
        assignment_id: data.assignment_id,
        hierarchy_item_id: data.hierarchy_item_id,
        suds_before: data.suds_before,
        suds_peak: data.suds_peak,
        suds_after: data.suds_after,
        duration_minutes: data.duration_minutes,
        did_ritual: data.did_ritual,
        ritual_description: data.ritual_description || null,
        notes: data.notes || null,
        date_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !exposureRun) {
      return NextResponse.json(
        { error: 'Failed to log exposure' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: exposureRun.id,
      message: 'Exposure logged. Nice work.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

