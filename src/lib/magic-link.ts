import crypto from 'crypto';
import { db } from './db';

export function generateMagicLinkToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createMagicLink(clientId: string): Promise<{ token: string; url: string }> {
  // Deactivate any existing active links for this client
  await db
    .from('client_magic_links')
    .update({ is_active: false })
    .eq('client_id', clientId)
    .eq('is_active', true);

  // Create new magic link
  const token = generateMagicLinkToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const url = `${appUrl}/client/${token}`;

  // Note: We store the token, but the URL is constructed dynamically
  // The URL field in the response is for convenience

  const { data, error } = await db
    .from('client_magic_links')
    .insert({
      client_id: clientId,
      token,
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create magic link');
  }

  return { token, url };
}

export async function validateMagicLink(token: string): Promise<{ clientId: string; displayName: string } | null> {
  const { data, error } = await db
    .from('client_magic_links')
    .select('client_id, is_active, clients!inner(display_name)')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  // Update last_used_at
  await db
    .from('client_magic_links')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token);

  return {
    clientId: data.client_id,
    displayName: (data.clients as any).display_name,
  };
}

