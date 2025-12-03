import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '../../middleware';
import { sendWorksheetAssignmentEmail } from '@/lib/email';
import { z } from 'zod';

const sendWorksheetAssignmentSchema = z.object({
  to: z.string().email(),
  clientName: z.string().min(1),
  worksheets: z.array(
    z.object({
      title: z.string(),
      modality: z.string(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await request.json();
    const data = sendWorksheetAssignmentSchema.parse(body);

    // Send email (fire-and-forget)
    await sendWorksheetAssignmentEmail({
      to: data.to,
      clientName: data.clientName,
      worksheets: data.worksheets,
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


