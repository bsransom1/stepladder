import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../../../middleware';
import { z } from 'zod';

const updateHierarchySchema = z.object({
  label: z.string().min(1).optional(),
  baseline_suds: z.number().int().min(0).max(100).optional(),
  order_index: z.number().int().optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { clientId: string; itemId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId, itemId } = params;

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

  // Verify item belongs to client
  const { data: item } = await db
    .from('erp_hierarchy_items')
    .select('id')
    .eq('id', itemId)
    .eq('client_id', clientId)
    .single();

  if (!item) {
    return NextResponse.json(
      { error: 'Hierarchy item not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const data = updateHierarchySchema.parse(body);

    const { data: updatedItem, error } = await db
      .from('erp_hierarchy_items')
      .update(data)
      .eq('id', itemId)
      .select()
      .single();

    if (error || !updatedItem) {
      return NextResponse.json(
        { error: 'Failed to update hierarchy item' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedItem);
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

