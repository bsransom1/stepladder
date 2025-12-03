import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../../middleware';
import { z } from 'zod';

const createHierarchySchema = z.object({
  items: z.array(
    z.object({
      label: z.string().min(1),
      baseline_suds: z.number().int().min(0).max(100),
      category: z.string().optional(),
      description: z.string().optional(),
    })
  ),
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

  // Get hierarchy items with metrics
  const { data: items, error } = await db
    .from('erp_hierarchy_items')
    .select('*')
    .eq('client_id', clientId)
    .order('order_index', { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hierarchy items' },
      { status: 500 }
    );
  }

  // Add metrics for each item
  const itemsWithMetrics = await Promise.all(
    items.map(async (item) => {
      const { data: runs } = await db
        .from('erp_exposure_runs')
        .select('suds_before, suds_after')
        .eq('hierarchy_item_id', item.id);

      const runs_completed = runs?.length || 0;
      const avg_suds_before = runs?.length
        ? runs.reduce((sum, r) => sum + r.suds_before, 0) / runs.length
        : item.baseline_suds;
      const avg_suds_after = runs?.length
        ? runs.reduce((sum, r) => sum + r.suds_after, 0) / runs.length
        : item.baseline_suds;

      return {
        ...item,
        metrics: {
          runs_completed,
          avg_suds_before: Math.round(avg_suds_before),
          avg_suds_after: Math.round(avg_suds_after),
        },
      };
    })
  );

  return NextResponse.json(itemsWithMetrics);
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
    const data = createHierarchySchema.parse(body);

    // Get current max order_index
    const { data: existingItems } = await db
      .from('erp_hierarchy_items')
      .select('order_index')
      .eq('client_id', clientId)
      .order('order_index', { ascending: false })
      .limit(1);

    let nextOrderIndex = existingItems?.[0]?.order_index ?? -1;

    // Create items
    const itemsToInsert = data.items.map((item) => ({
      client_id: clientId,
      therapist_id: auth.therapist.id,
      label: item.label,
      description: item.description,
      category: item.category,
      baseline_suds: item.baseline_suds,
      order_index: ++nextOrderIndex,
      is_active: true,
    }));

    const { data: createdItems, error } = await db
      .from('erp_hierarchy_items')
      .insert(itemsToInsert)
      .select();

    if (error || !createdItems) {
      return NextResponse.json(
        { error: 'Failed to create hierarchy items' },
        { status: 500 }
      );
    }

    return NextResponse.json(createdItems);
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

