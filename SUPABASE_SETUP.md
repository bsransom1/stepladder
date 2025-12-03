# Supabase Setup Guide

Follow these steps to set up Supabase for Stepladder.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: Stepladder (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier works fine
5. Click **"Create new project"**
6. Wait 2-3 minutes for the project to be ready

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **API**
2. You'll see several values. Copy these:

   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
     - Example: `https://xxxxxxxxxxxxx.supabase.co`
   
   - **anon public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Long string starting with `eyJ...`
   
   - **service_role key**: This is your `SUPABASE_SERVICE_ROLE_KEY`
     - Long string starting with `eyJ...` (⚠️ Keep this secret!)

## Step 3: Run the Database Migration

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` in your project
4. Copy **ALL** the SQL code from that file
5. Paste it into the Supabase SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned" - this means it worked!

## Step 4: Create Environment Variables File

1. In your project root directory (`/Users/bsransom/StepLadder`), create a file named `.env.local`
2. Add the following content (replace with your actual values):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

JWT_SECRET=your-random-secret-string-here-min-32-chars

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Generate JWT_SECRET

Run this command in your terminal to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

## Step 5: Verify Setup

1. **Restart your dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Check the terminal** - you should NOT see:
   - ❌ "Missing Supabase environment variables"
   - ❌ "Supabase admin client not initialized"

3. **Test the database**:
   - Go to Supabase dashboard → **Table Editor**
   - You should see these tables:
     - `therapists`
     - `clients`
     - `client_magic_links`
     - `erp_hierarchy_items`
     - `assignments`
     - `erp_exposure_runs`

## Step 6: Test Authentication

1. Go to `http://localhost:3000/signup`
2. Create a test account
3. You should be redirected to the dashboard

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Make sure the file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
- Restart your dev server after creating/editing the file

### "Cannot read properties of null"
- This means Supabase isn't initialized
- Check that all environment variables are set correctly
- Make sure there are no extra spaces or quotes around the values

### Migration errors
- Make sure you copied the ENTIRE SQL file
- Check that you're running it in the SQL Editor (not Table Editor)
- If tables already exist, you might need to drop them first (use with caution!)

### Still having issues?
- Check the server logs for detailed error messages
- Verify your Supabase project is active (not paused)
- Make sure you're using the correct project URL and keys

## Quick Reference

**Where to find Supabase credentials:**
- Dashboard → Settings → API

**Where to run SQL:**
- Dashboard → SQL Editor

**Where to view tables:**
- Dashboard → Table Editor

**Environment file location:**
- Project root: `/Users/bsransom/StepLadder/.env.local`

