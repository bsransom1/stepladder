import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../middleware';
import { z } from 'zod';
import { WorksheetType } from '@/config/worksheetDefinitions';

// Default goal mapping for worksheet types
const DEFAULT_GOALS: Record<WorksheetType, string> = {
  erp_exposure_hierarchy: 'EXPOSURE_HIERARCHY',
  erp_exposure_run: 'EXPOSURE_PRACTICE',
  cbt_thought_record: 'THOUGHT_RECORD',
  dbt_diary_card: 'DAILY_DIARY_CARD',
  sleep_diary: 'SLEEP_TRACKING',
  sud_craving_log: 'CRAVING_LOG',
};

const createAssignmentSchema = z.object({
  modality: z.string().default('ERP'),
  goal: z.string().optional(),
  worksheetType: z.string().optional(),
  worksheet_type: z.string().optional(), // Support both for backward compatibility
  config: z.record(z.any()).optional().default({}),
}).refine((data) => data.worksheetType || data.worksheet_type, {
  message: "Either worksheetType or worksheet_type must be provided",
});

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;

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

  const { data: assignments, error } = await db
    .from('assignments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }

  return NextResponse.json(assignments || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;

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

  try {
    const body = await request.json();
    const data = createAssignmentSchema.parse(body);

    // Support both worksheetType and worksheet_type for backward compatibility
    const worksheetType = (data.worksheetType || data.worksheet_type) as WorksheetType;
    const goal = data.goal || DEFAULT_GOALS[worksheetType] || 'GENERAL';

    const { data: assignment, error } = await db
      .from('assignments')
      .insert({
        client_id: clientId,
        therapist_id: auth.therapist.id,
        modality: data.modality,
        goal: goal,
        worksheet_type: worksheetType,
        config: data.config || {},
        is_active: true,
      })
      .select()
      .single();

    if (error || !assignment) {
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignment);
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

