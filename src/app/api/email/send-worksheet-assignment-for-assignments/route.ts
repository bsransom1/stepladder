import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '../../middleware';
import { sendWorksheetAssignmentEmailForAssignments } from '@/lib/email';
import { z } from 'zod';

const sendWorksheetAssignmentForAssignmentsSchema = z.object({
  clientEmail: z.string().email(),
  clientName: z.string().min(1),
  assignments: z.array(
    z.object({
      id: z.string(),
      worksheetId: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const data = sendWorksheetAssignmentForAssignmentsSchema.parse(body);

    // Send email (fire-and-forget)
    await sendWorksheetAssignmentEmailForAssignments({
      clientEmail: data.clientEmail,
      clientName: data.clientName,
      assignments: data.assignments,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send worksheet assignment email:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Don't fail the request if email fails - just log it
    return NextResponse.json(
      { success: false, error: 'Email sending failed but request succeeded' },
      { status: 200 }
    );
  }
}

