import { NextRequest, NextResponse } from 'next/server';
import { getTherapistFromToken } from '@/lib/auth';

export async function authenticateRequest(request: NextRequest): Promise<{
  therapist: { id: string; email: string; name: string };
} | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const therapist = await getTherapistFromToken(token);
  
  if (!therapist) {
    return null;
  }

  return { therapist };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

