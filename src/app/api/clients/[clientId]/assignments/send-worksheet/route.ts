import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../../middleware';
import { z } from 'zod';
import { WORKSHEET_DEFINITIONS, WorksheetType } from '@/config/worksheetDefinitions';

const sendWorksheetSchema = z.object({
  modality: z.string(),
  worksheetType: z.string(),
  config: z.record(z.any()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  const { clientId } = params;

  try {
    const body = await request.json();
    const data = sendWorksheetSchema.parse(body);

    // Verify client belongs to therapist
    const { data: client, error: clientError } = await db
      .from('clients')
      .select('id, display_name, email')
      .eq('id', clientId)
      .eq('therapist_id', auth.therapist.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.email) {
      return NextResponse.json(
        { error: 'Client does not have an email address' },
        { status: 400 }
      );
    }

    // Get worksheet definition
    const worksheetType = data.worksheetType as WorksheetType;
    const definition = WORKSHEET_DEFINITIONS[worksheetType];

    if (!definition) {
      return NextResponse.json(
        { error: 'Invalid worksheet type' },
        { status: 400 }
      );
    }

    // Generate PDF content (simplified - in production, use a proper PDF library)
    const pdfContent = generateWorksheetPDF(client, definition, data.config || {});

    // Send email with PDF attachment
    // Note: This is a placeholder - you'll need to integrate with an email service
    // like SendGrid, AWS SES, or nodemailer
    const emailSent = await sendEmailWithPDF({
      to: client.email,
      subject: `Your ${definition.title} - ${client.display_name}`,
      clientName: client.display_name,
      worksheetTitle: definition.title,
      pdfContent: pdfContent,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please check your email configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Worksheet sent successfully to ${client.email}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error sending worksheet:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate PDF content (placeholder - replace with actual PDF generation)
function generateWorksheetPDF(
  client: { display_name: string; email?: string },
  definition: typeof WORKSHEET_DEFINITIONS[WorksheetType],
  config: Record<string, any>
): string {
  // This is a simplified version - in production, use a library like:
  // - jsPDF
  // - PDFKit
  // - Puppeteer (to generate from HTML)
  // - react-pdf/renderer

  const configFields = definition.configFields || [];
  let pdfText = `${definition.title}\n`;
  pdfText += `For: ${client.display_name}\n`;
  if (client.email) {
    pdfText += `Email: ${client.email}\n`;
  }
  pdfText += `\n${definition.description || ''}\n\n`;
  pdfText += 'Configuration:\n';
  pdfText += '─'.repeat(50) + '\n';

  configFields.forEach((field) => {
    const value = config[field.key] !== undefined ? config[field.key] : field.defaultValue;
    let displayValue = 'Not specified';
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'boolean') {
        displayValue = value ? 'Yes' : 'No';
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else {
        displayValue = String(value);
      }
    }
    pdfText += `${field.label}: ${displayValue}\n`;
  });

  if (config.instructions) {
    pdfText += '\nInstructions:\n';
    pdfText += '─'.repeat(50) + '\n';
    pdfText += config.instructions + '\n';
  }

  return pdfText;
}

// Send email with PDF using Resend
async function sendEmailWithPDF({
  to,
  subject,
  clientName,
  worksheetTitle,
  pdfContent,
}: {
  to: string;
  subject: string;
  clientName: string;
  worksheetTitle: string;
  pdfContent: string;
}): Promise<boolean> {
  // Use the shared email service
  const { sendEmail, generateWorksheetEmailHTML } = await import('@/lib/email');
  
  const emailHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${worksheetTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f7;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 30px;">
                    <h1 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700;">StepLadder</h1>
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hi ${clientName.split(' ')[0]},
                    </p>
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Please find your <strong>${worksheetTitle}</strong> attached below.
                    </p>
                    <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>Privacy Notice:</strong> This email contains sensitive health information. Please do not forward this email to others.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return await sendEmail({
    to,
    subject,
    html: emailHTML,
    text: `Dear ${clientName},\n\nPlease find attached your ${worksheetTitle}.\n\nBest regards,\nStepLadder Team`,
  });
}

