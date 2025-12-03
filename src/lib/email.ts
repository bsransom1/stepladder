/**
 * Email utility for sending worksheet emails
 * 
 * Uses Resend (https://resend.com) for email delivery.
 * 
 * Required Environment Variables:
 * - RESEND_API_KEY: Secret API key from Resend dashboard
 * - EMAIL_FROM: Sender email address (e.g., "StepLadder <noreply@stepladder.app>")
 * - NEXT_PUBLIC_APP_URL: Base URL for the app (used in email links)
 * 
 * Setup:
 * 1. Sign up at https://resend.com
 * 2. Get your API key from the dashboard
 * 3. Add RESEND_API_KEY to your .env.local file
 * 4. Add EMAIL_FROM (e.g., "StepLadder <noreply@yourdomain.com>")
 * 5. Add NEXT_PUBLIC_APP_URL (e.g., "https://stepladder.app")
 * 6. Verify your domain in Resend dashboard
 * 
 * Alternative providers:
 * - SendGrid: https://sendgrid.com
 * - AWS SES: https://aws.amazon.com/ses/
 * - Nodemailer: https://nodemailer.com
 * 
 * NOTE: This module is server-only and cannot be imported in client components.
 * Use API routes or server actions to call these functions from client components.
 */

import 'server-only';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Helper to get Resend client (lazy initialization)
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

/**
 * Send an email using Resend
 * 
 * Returns true if email was sent successfully, false otherwise.
 * In development (without RESEND_API_KEY), logs the email instead.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log('📧 sendEmail called with:', { to: options.to, subject: options.subject });
  console.log('📧 RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM);
  
  const resend = getResendClient();
  
  // If no API key is configured, log and return true (for development)
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('📧 Email would be sent (RESEND_API_KEY not configured):', {
      to: options.to,
      subject: options.subject,
      from: process.env.EMAIL_FROM || 'StepLadder <noreply@stepladder.app>',
    });
    console.log('To enable email sending, add RESEND_API_KEY to your .env.local file');
    // Return true in development so the UI flow works
    // In production, you should return false to indicate email wasn't sent
    return process.env.NODE_ENV === 'development';
  }

  try {
    const from = process.env.EMAIL_FROM || 'StepLadder <noreply@stepladder.app>';
    console.log('📧 Attempting to send email via Resend:', { from, to: options.to });
    
    const { data, error } = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('❌ Email send error:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('✅ Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Email send exception:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

/**
 * Generate HTML email template for worksheet
 */
export function generateWorksheetEmailHTML(
  clientName: string,
  worksheetTitle: string,
  completionDate: string,
  entries: any[],
  worksheetType: string
): string {
  const firstName = clientName.split(' ')[0];
  
  // Format entries based on worksheet type
  let entriesHTML = '';
  
    if (worksheetType === 'erp_exposure_run') {
    entriesHTML = entries.map((entry: any) => {
      const date = new Date(entry.date_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      
      return `
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-left: 3px solid #16a34a; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px; font-weight: 600;">
            ${entry.hierarchy_label || 'Exposure'} - ${date}
          </h3>
          <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            <p style="margin: 5px 0;"><strong>SUDS Before:</strong> ${entry.suds_before}/100</p>
            <p style="margin: 5px 0;"><strong>SUDS Peak:</strong> ${entry.suds_peak}/100</p>
            <p style="margin: 5px 0;"><strong>SUDS After:</strong> ${entry.suds_after}/100</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${entry.duration_minutes} minutes</p>
            ${entry.did_ritual ? `<p style="margin: 5px 0;"><strong>Ritual:</strong> ${entry.ritual_description || 'Yes'}</p>` : ''}
            ${entry.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${entry.notes}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } else if (worksheetType === 'erp_exposure_hierarchy') {
    entriesHTML = entries.map((item: any, index: number) => {
      return `
        <div style="margin-bottom: 15px; padding: 15px; background-color: #f9fafb; border-left: 3px solid #16a34a; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px; font-weight: 600;">
            Step ${index + 1}: ${item.label}
          </h3>
          <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            <p style="margin: 5px 0;"><strong>Baseline SUDS:</strong> ${item.baseline_suds}/100</p>
            ${item.category ? `<p style="margin: 5px 0;"><strong>Category:</strong> ${item.category}</p>` : ''}
            ${item.description ? `<p style="margin: 5px 0;"><strong>Description:</strong> ${item.description}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  } else {
    // Generic format for other worksheet types
    entriesHTML = entries.map((entry: any, index: number) => {
      const date = entry.date_time || entry.created_at || entry.date;
      const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) : 'Date not available';
      
      return `
        <div style="margin-bottom: 15px; padding: 15px; background-color: #f9fafb; border-left: 3px solid #16a34a; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 16px; font-weight: 600;">
            Entry ${index + 1} - ${formattedDate}
          </h3>
          <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${JSON.stringify(entry, null, 2)}</pre>
          </div>
        </div>
      `;
    }).join('');
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${worksheetTitle}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7;">
                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                      StepLadder
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hi ${firstName},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Your completed <strong>${worksheetTitle}</strong> is attached below. This worksheet was completed on ${completionDate}.
                    </p>
                    
                    <h2 style="margin: 30px 0 15px 0; color: #111827; font-size: 20px; font-weight: 600;">
                      Worksheet Entries
                    </h2>
                    
                    ${entriesHTML || '<p style="color: #6b7280; font-size: 14px;">No entries found.</p>'}
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 4px;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        <strong>Privacy Notice:</strong> This email contains sensitive health information. Please do not forward this email to others. If you did not expect this email, please contact your therapist.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      © ${new Date().getFullYear()} StepLadder. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Interface for worksheet assignment email input
 */
export interface WorksheetAssignmentEmailInput {
  to: string;
  clientName: string;
  worksheets: {
    title: string;
    modality: string;
  }[];
}

/**
 * Interface for worksheet assignment email input using actual assignments
 */
export interface WorksheetAssignmentEmailForAssignmentsInput {
  clientEmail: string;
  clientName: string;
  assignments: Array<{
    id: string;
    worksheetId: string;
  }>;
}

/**
 * Send an email to a client notifying them of newly assigned worksheets
 * 
 * This is a fire-and-forget operation that won't block the UI flow.
 * If RESEND_API_KEY is not set, the function will return silently without sending.
 */
export async function sendWorksheetAssignmentEmail(
  input: WorksheetAssignmentEmailInput
): Promise<void> {
  const { to, clientName, worksheets } = input;

  if (!process.env.RESEND_API_KEY) {
    // Fail quietly in dev if key is missing
    console.warn('RESEND_API_KEY is not set. Worksheet assignment email will not be sent.');
    return;
  }

  if (worksheets.length === 0) {
    // No worksheets to notify about
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stepladder.app';
  const subject = 'New therapy worksheets from your clinician';

  const worksheetList = worksheets
    .map((w) => `- ${w.title} (${w.modality})`)
    .join('\n');

  const text = `
Hi ${clientName},

Your clinician has assigned new therapy worksheets to help support your treatment.

Assigned worksheets:

${worksheetList}

You can log in to StepLadder to complete them: ${appUrl}

If you weren't expecting this email, you can ignore it.

— StepLadder
  `.trim();

  // Generate HTML version for better email client compatibility
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7;">
                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                      StepLadder
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hi ${clientName},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Your clinician has assigned new therapy worksheets to help support your treatment.
                    </p>
                    
                    <h2 style="margin: 30px 0 15px 0; color: #111827; font-size: 20px; font-weight: 600;">
                      Assigned Worksheets
                    </h2>
                    
                    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #111827; font-size: 16px; line-height: 1.8;">
                      ${worksheets.map((w) => `<li>${w.title} (${w.modality})</li>`).join('')}
                    </ul>
                    
                    <p style="margin: 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      <a href="${appUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Log in to StepLadder to complete them →</a>
                    </p>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-left: 3px solid #e4e4e7; border-radius: 4px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you weren't expecting this email, you can ignore it.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      — StepLadder
                    </p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                      © ${new Date().getFullYear()} StepLadder. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    await sendEmail({
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    // Log error but don't throw - email failure shouldn't break the flow
    console.error('Failed to send worksheet assignment email:', error);
  }
}

/**
 * Send an email to a client notifying them of newly assigned worksheets using actual assignments
 * This version includes magic links to each worksheet
 * 
 * This is a fire-and-forget operation that won't block the UI flow.
 * If RESEND_API_KEY is not set, the function will return silently without sending.
 */
export async function sendWorksheetAssignmentEmailForAssignments(
  input: WorksheetAssignmentEmailForAssignmentsInput
): Promise<void> {
  const { clientEmail, clientName, assignments } = input;

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set. Worksheet assignment email will not be sent.');
    return;
  }

  if (assignments.length === 0) {
    return;
  }

  // Import here to avoid circular dependencies
  const { getWorksheetById } = await import('@/data/worksheets');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stepladder.app';
  const subject = 'New therapy worksheets from your clinician';

  const worksheetLines: string[] = [];
  const worksheetListItems: string[] = [];

  for (const assignment of assignments) {
    const worksheet = getWorksheetById(assignment.worksheetId);
    if (!worksheet) continue;

    const link = `${appUrl}/p/worksheets/${assignment.id}`;
    worksheetLines.push(`- ${worksheet.title} (${worksheet.modality})\n  ${link}`);
    worksheetListItems.push(
      `<li style="margin-bottom: 15px;">
        <strong>${worksheet.title}</strong> (${worksheet.modality})<br>
        <a href="${link}" style="color: #2563eb; text-decoration: none; font-weight: 600; font-size: 14px;">Complete this worksheet →</a>
      </li>`
    );
  }

  if (worksheetLines.length === 0) {
    return;
  }

  const text = `
Hi ${clientName},

Your clinician has assigned new therapy worksheets to you in StepLadder.

You can complete them using the following links:

${worksheetLines.join('\n\n')}

If you weren't expecting this email, you can ignore it.

— StepLadder
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f7; padding: 20px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 30px 30px 20px 30px; background-color: #ffffff; border-bottom: 1px solid #e4e4e7;">
                    <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">
                      StepLadder
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 30px;">
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Hi ${clientName},
                    </p>
                    
                    <p style="margin: 0 0 20px 0; color: #111827; font-size: 16px; line-height: 1.6;">
                      Your clinician has assigned new therapy worksheets to help support your treatment.
                    </p>
                    
                    <h2 style="margin: 30px 0 15px 0; color: #111827; font-size: 20px; font-weight: 600;">
                      Assigned Worksheets
                    </h2>
                    
                    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #111827; font-size: 16px; line-height: 1.8; list-style: none;">
                      ${worksheetListItems.join('')}
                    </ul>
                    
                    <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-left: 3px solid #e4e4e7; border-radius: 4px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If you weren't expecting this email, you can ignore it.
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e4e4e7; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px;">
                      — StepLadder
                    </p>
                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
                      © ${new Date().getFullYear()} StepLadder. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    await sendEmail({
      to: clientEmail,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error('Failed to send worksheet assignment email:', error);
  }
}

