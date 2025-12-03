import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '@/app/api/middleware';
import { WORKSHEET_DEFINITIONS, WorksheetType } from '@/config/worksheetDefinitions';
import { sendEmail, generateWorksheetEmailHTML } from '@/lib/email';
import { subDays } from 'date-fns';

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string; worksheetType: string } }
) {
  const { clientId, worksheetType } = params;
  console.log('📧 Email endpoint called:', { clientId, worksheetType });
  
  const auth = await authenticateRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    console.log('📧 Processing email request for worksheet type:', worksheetType);
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

    console.log('📧 Client found:', { name: client.display_name, email: client.email });
    
    if (!client.email) {
      console.log('❌ Client does not have email address');
      return NextResponse.json(
        { error: 'Client does not have an email address on file' },
        { status: 400 }
      );
    }

    // Validate worksheet type
    const type = worksheetType as WorksheetType;
    const definition = WORKSHEET_DEFINITIONS[type];
    
    if (!definition) {
      return NextResponse.json(
        { error: 'Invalid worksheet type' },
        { status: 400 }
      );
    }

    // Fetch worksheet entries based on type
    let entries: any[] = [];
    let completionDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    switch (type) {
      case 'erp_exposure_run':
        // Get exposure runs from last 30 days
        const startDate = subDays(new Date(), 30).toISOString();
        const { data: runs, error: runsError } = await db
          .from('erp_exposure_runs')
          .select(`
            *,
            erp_hierarchy_items!inner(label)
          `)
          .eq('client_id', clientId)
          .gte('date_time', startDate)
          .order('date_time', { ascending: false });

        if (runsError) {
          console.error('Error fetching exposure runs:', runsError);
        } else {
          entries = (runs || []).map((run: any) => ({
            ...run,
            hierarchy_label: run.erp_hierarchy_items?.label,
          }));
          
          // Use the most recent entry's date as completion date
          if (entries.length > 0) {
            completionDate = new Date(entries[0].date_time).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
          }
        }
        break;

      case 'erp_exposure_hierarchy':
        // For hierarchy, we'll send the items instead of entries
        const { data: items, error: itemsError } = await db
          .from('erp_hierarchy_items')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (itemsError) {
          console.error('Error fetching hierarchy items:', itemsError);
        } else {
          entries = items || [];
          if (entries.length > 0) {
            completionDate = new Date(entries[entries.length - 1].updated_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
          }
        }
        break;

      case 'sleep_diary':
      case 'cbt_thought_record':
      case 'dbt_diary_card':
      case 'sud_craving_log':
        // For now, return empty entries - these worksheet types need their own entry tables
        // TODO: Implement entry fetching for these worksheet types
        console.log('⚠️ Worksheet type not fully implemented for email:', type);
        entries = [];
        break;

      // Add other worksheet types as needed
      default:
        console.log('❌ Unsupported worksheet type:', type);
        return NextResponse.json(
          { error: `Worksheet type "${type}" not yet supported for email` },
          { status: 400 }
        );
    }

    console.log('📧 Found entries:', entries.length);
    
    if (entries.length === 0) {
      console.log('❌ No entries found for worksheet');
      return NextResponse.json(
        { error: 'No completed entries found for this worksheet' },
        { status: 400 }
      );
    }

    // Generate email HTML
    console.log('📧 Generating email HTML...');
    const emailHTML = generateWorksheetEmailHTML(
      client.display_name,
      definition.title,
      completionDate,
      entries,
      type
    );

    // Send email
    console.log('📧 Sending email to:', client.email);
    const emailSent = await sendEmail({
      to: client.email,
      subject: `Your completed ${definition.title} from StepLadder`,
      html: emailHTML,
      text: `Hi ${client.display_name.split(' ')[0]},\n\nYour completed ${definition.title} is attached below.\n\nThis email contains sensitive health information. Please do not forward.`,
    });
    
    console.log('📧 Email send result:', emailSent);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please check your email configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Worksheet emailed successfully to ${client.email}`,
    });
  } catch (error) {
    console.error('Error sending worksheet email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

