# Stepladder Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to get your credentials
3. Run the migration file to create the database schema:

```bash
# Copy the SQL from supabase/migrations/001_initial_schema.sql
# Paste it into Supabase SQL Editor and run it
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

JWT_SECRET=your_random_secret_key_here_min_32_chars

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Generate a secure random string for `JWT_SECRET`. You can use:
```bash
openssl rand -base64 32
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## First Steps

1. **Sign up** as a therapist at `/signup`
2. **Create a client** from the dashboard
3. **Build an ERP hierarchy** for the client
4. **Assign homework** (exposures)
5. **Share the magic link** with your client
6. **Client logs exposures** via the magic link

## Project Structure

```
src/
  app/                    # Next.js app router pages
    api/                  # API routes
      auth/               # Authentication endpoints
      clients/            # Client management endpoints
      public/client/      # Public client portal endpoints
    client/[token]/       # Client portal (magic link access)
    clients/              # Therapist client management pages
    dashboard/            # Therapist dashboard
    login/                # Login page
    signup/               # Signup page
  components/            # React components
  lib/                   # Utilities and helpers
  types/                  # TypeScript type definitions
```

## Key Features Implemented

✅ Therapist authentication (signup/login)
✅ Client management with magic links
✅ ERP hierarchy builder
✅ Homework assignment creation
✅ Client portal (mobile-first)
✅ Exposure logging with SUDS tracking
✅ Metrics dashboard (exposures completed, SUDS trends, rituals)

## Database Schema

The application uses the following main tables:
- `therapists` - Therapist accounts
- `clients` - Client records
- `client_magic_links` - Magic link tokens for client access
- `erp_hierarchy_items` - ERP exposure hierarchy steps
- `assignments` - Homework assignments
- `erp_exposure_runs` - Logged exposure runs

## API Endpoints

### Therapist Endpoints (require auth token)
- `POST /api/auth/signup` - Create therapist account
- `POST /api/auth/login` - Therapist login
- `GET /api/clients` - List clients
- `POST /api/clients` - Create client
- `GET /api/clients/:id` - Get client details
- `POST /api/clients/:id/erp/hierarchy-items` - Create hierarchy items
- `POST /api/clients/:id/assignments` - Create assignment
- `GET /api/clients/:id/metrics` - Get client metrics

### Client Endpoints (magic link auth)
- `GET /api/public/client/:token/home` - Get client home data
- `POST /api/public/client/:token/erp/exposure-runs` - Log exposure

## Troubleshooting

### Database Connection Issues
- Verify your Supabase credentials in `.env.local`
- Check that the migration has been run successfully
- Ensure your Supabase project is active

### Authentication Issues
- Clear browser localStorage if tokens are stale
- Verify `JWT_SECRET` is set correctly
- Check that password hashing is working (bcryptjs)

### Magic Link Issues
- Ensure `NEXT_PUBLIC_APP_URL` matches your deployment URL
- Check that magic links are active in the database
- Verify token format is correct (64-character hex string)

## Next Steps

- Add email/SMS reminders (v1.1)
- Add CBT thought records (v2)
- Add DBT diary cards (v2)
- Add practice-level multi-therapist support (v2)

