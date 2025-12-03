import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../middleware';
import { createMagicLink } from '@/lib/magic-link';
import { z } from 'zod';
import { format, subDays } from 'date-fns';
import { WorksheetType } from '@/config/worksheetDefinitions';

const createClientSchema = z.object({
  display_name: z.string().min(1),
  email: z.union([
    z.string().email(),
    z.literal(''),
    z.undefined(),
  ]).optional(),
  primary_modality: z.string().optional().default('ERP'),
  initialWorksheets: z.array(z.object({
    worksheetType: z.string(),
    config: z.record(z.any()).optional(),
  })).optional(),
  sendWorksheet: z.boolean().optional().default(true),
});

// Default goal mapping for worksheet types
const DEFAULT_GOALS: Record<WorksheetType, string> = {
  erp_exposure_hierarchy: 'EXPOSURE_HIERARCHY',
  erp_exposure_run: 'EXPOSURE_PRACTICE',
  cbt_thought_record: 'THOUGHT_RECORD',
  dbt_diary_card: 'DAILY_DIARY_CARD',
  sleep_diary: 'SLEEP_TRACKING',
  sud_craving_log: 'CRAVING_LOG',
};

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'active';

  // Get clients with summary metrics
  const { data: clients, error } = await db
    .from('clients')
    .select('id, display_name, email, status, primary_modality, created_at, updated_at')
    .eq('therapist_id', auth.therapist.id)
    .eq('status', status)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }

  // Get metrics for each client
  const clientsWithMetrics = await Promise.all(
    clients.map(async (client) => {
      const weekAgo = subDays(new Date(), 7).toISOString();

      // Count exposures completed this week
      const { count: completedCount } = await db
        .from('erp_exposure_runs')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .gte('date_time', weekAgo);

      // Count exposures assigned this week
      const { count: assignedCount } = await db
        .from('assignments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
        .eq('is_active', true)
        .eq('modality', 'ERP')
        .eq('worksheet_type', 'erp_exposure_run');

      // Get last activity
      const { data: lastRun } = await db
        .from('erp_exposure_runs')
        .select('date_time')
        .eq('client_id', client.id)
        .order('date_time', { ascending: false })
        .limit(1)
        .single();

      return {
        ...client,
        exposures_completed_this_week: completedCount || 0,
        exposures_assigned_this_week: assignedCount || 0,
        last_activity_at: lastRun?.date_time || null,
      };
    })
  );

  return NextResponse.json(clientsWithMetrics);
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));
    const data = createClientSchema.parse(body);
    console.log('Parsed data:', JSON.stringify(data, null, 2));

    // Create client
    const insertData = {
      therapist_id: auth.therapist.id,
      display_name: data.display_name,
      email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
      primary_modality: data.primary_modality,
      status: 'active',
    };
    console.log('Inserting client with data:', JSON.stringify(insertData, null, 2));
    
    const { data: client, error: clientError } = await db
      .from('clients')
      .insert(insertData)
      .select()
      .single();

    if (clientError || !client) {
      console.error('Failed to create client:', clientError);
      return NextResponse.json(
        { error: 'Failed to create client', details: clientError?.message },
        { status: 500 }
      );
    }
    
    console.log('Client created successfully:', client.id);

    // Create initial assignments if worksheets are provided and sendWorksheet is true
    if (data.sendWorksheet !== false && data.initialWorksheets && data.initialWorksheets.length > 0) {
      console.log('Creating initial assignments:', data.initialWorksheets.length);
      const assignmentsToCreate = data.initialWorksheets.map((worksheet: { worksheetType: string; config?: Record<string, any> }) => ({
        client_id: client.id,
        therapist_id: auth.therapist.id,
        modality: data.primary_modality || 'ERP',
        goal: DEFAULT_GOALS[worksheet.worksheetType as WorksheetType] || 'GENERAL',
        worksheet_type: worksheet.worksheetType,
        config: worksheet.config || {},
        is_active: true,
      }));

      console.log('Assignments to create:', JSON.stringify(assignmentsToCreate, null, 2));
      const { error: assignmentError } = await db
        .from('assignments')
        .insert(assignmentsToCreate);

      if (assignmentError) {
        console.error('Failed to create initial assignments:', assignmentError);
        // Don't fail the whole request if assignments fail, but log it
      } else {
        console.log('Assignments created successfully');
      }
    }

    // Create magic link
    let magicLink = null;
    try {
      magicLink = await createMagicLink(client.id);
    } catch (magicLinkError) {
      console.error('Failed to create magic link:', magicLinkError);
      // Don't fail the whole request if magic link creation fails
      // The client is already created, so we can continue
    }

    return NextResponse.json({
      client,
      magic_link: magicLink,
    });
  } catch (error) {
    console.error('Error creating client:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    // Log the actual error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack, error });
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

