import { supabaseAdmin } from './supabase';

if (!supabaseAdmin) {
  console.error('Supabase admin client not initialized. Check SUPABASE_SERVICE_ROLE_KEY.');
  throw new Error(
    'Supabase is not configured. Please set up your environment variables:\n' +
    '1. Create a Supabase project at https://supabase.com\n' +
    '2. Get your credentials from Project Settings > API\n' +
    '3. Create a .env.local file with:\n' +
    '   NEXT_PUBLIC_SUPABASE_URL=your_project_url\n' +
    '   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\n' +
    '   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key\n' +
    '   JWT_SECRET=your_random_secret\n' +
    '4. Run the migration from supabase/migrations/001_initial_schema.sql\n' +
    '5. Restart your dev server'
  );
}

export const db = supabaseAdmin;

