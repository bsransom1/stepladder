import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../middleware';
import { z } from 'zod';

const updateAssignmentSchema = z.object({
  config: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { assignmentId } = params;

  // Verify assignment belongs to therapist
  const { data: assignment } = await db
    .from('assignments')
    .select('id, therapist_id')
    .eq('id', assignmentId)
    .eq('therapist_id', auth.therapist.id)
    .single();

  if (!assignment) {
    return NextResponse.json(
      { error: 'Assignment not found' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const data = updateAssignmentSchema.parse(body);

    const updateData: any = {};
    if (data.config !== undefined) updateData.config = data.config;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const { data: updatedAssignment, error } = await db
      .from('assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select()
      .single();

    if (error || !updatedAssignment) {
      return NextResponse.json(
        { error: 'Failed to update assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedAssignment);
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

