# StepLadder

A therapist-first, science-based homework OS for structured therapies (starting with ERP for OCD).

StepLadder helps therapists assign, track, and review evidence-based therapy worksheets with their clients. Clients access homework via secure magic links—no apps or passwords required.

## Features

- ✅ **Therapist Authentication**: Secure JWT-based authentication for therapists
- ✅ **Client Management**: Add and manage clients with magic link access
- ✅ **ERP Exposure Hierarchy Builder**: Build and manage exposure hierarchies for OCD treatment
- ✅ **Worksheet Assignment System**: Assign CBT, ERP, DBT, and other evidence-based worksheets
- ✅ **Mobile-First Client Portal**: Clients complete homework via secure magic links
- ✅ **Exposure Logging**: Track SUDS scores, exposure duration, and ritual prevention
- ✅ **Progress Analytics**: View completion rates, client progress, and practice-wide metrics
- ✅ **Magic Link Access**: Secure, expiring links for client access—no accounts needed

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up free](https://supabase.com))
- (Optional) A Resend account for email sending ([sign up free](https://resend.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

- **Supabase**: Get your credentials from your Supabase project (Settings → API)
- **JWT Secret**: Generate a random string (e.g., `openssl rand -base64 32`)
- **Resend** (optional): For email sending, get your API key from Resend dashboard
- **App URL**: Set to `http://localhost:3000` for development

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Run the migration: Copy and paste the contents of `supabase/migrations/001_initial_schema.sql` and execute it
4. Run the second migration: Copy and paste `supabase/migrations/002_add_client_email.sql` and execute it

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and sign up for a therapist account!

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT for therapists, magic links for clients
- **Email**: Resend (optional, for worksheet assignment emails)

## Project Structure

```
src/
  app/                    # Next.js app router pages
    api/                  # API routes (therapist & client)
    client/[token]/       # Client portal (magic link)
    clients/              # Client management
    dashboard/            # Therapist dashboard
  components/             # React components
  lib/                    # Utilities, DB client, auth
  types/                  # TypeScript definitions
supabase/
  migrations/             # Database schema migrations
```

## Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./DEPLOYMENT.md) - **Production deployment and domain setup**
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration guide
- [Email Setup](./EMAIL_SETUP.md) - Email configuration guide
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)
- `JWT_SECRET` - Secret key for JWT token signing
- `RESEND_API_KEY` - (Optional) Resend API key for email sending
- `EMAIL_FROM` - (Optional) Email sender address
- `NEXT_PUBLIC_APP_URL` - Your application URL

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

# stepladder
