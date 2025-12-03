import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest, unauthorizedResponse } from '../../../../middleware';
import { createMagicLink } from '@/lib/magic-link';

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

  // Create new magic link (this will deactivate old ones)
  const magicLink = await createMagicLink(clientId);

  return NextResponse.json({
    url: magicLink.url,
    token: magicLink.token,
  });
}

