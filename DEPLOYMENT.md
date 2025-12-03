# Deployment Guide

This guide covers deploying StepLadder to production and connecting it to a custom domain.

## Recommended: Vercel (Easiest for Next.js)

Vercel is the recommended platform for Next.js applications. It provides:
- ✅ Zero-config deployment
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Environment variable management
- ✅ Custom domain support
- ✅ Free tier available

### Step 1: Prepare Your Code

1. **Push to GitHub** (or GitLab/Bitbucket):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/stepladder.git
   git push -u origin main
   ```

2. **Verify build works locally**:
   ```bash
   npm run build
   ```

### Step 2: Deploy to Vercel

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. **Import project**: Click "Add New Project" → Import your GitHub repository
3. **Configure**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Set Environment Variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     JWT_SECRET=your_jwt_secret
     RESEND_API_KEY=your_resend_key
     EMAIL_FROM=StepLadder <noreply@yourdomain.com>
     NEXT_PUBLIC_APP_URL=https://yourdomain.com
     ```
   - **Important**: Set `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://stepladder.app`)

5. **Deploy**: Click "Deploy" - Vercel will build and deploy automatically

### Step 3: Connect Custom Domain

1. **In Vercel Dashboard**:
   - Go to your project → Settings → Domains
   - Click "Add Domain"
   - Enter your domain (e.g., `stepladder.app`)

2. **Configure DNS** (at your domain registrar):
   
   **Option A: Root Domain (stepladder.app)**
   - Add an A record:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```
   - Or add a CNAME record:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     ```
   - Note: Some registrars don't support CNAME on root domain. Use A record if needed.

   **Option B: Subdomain (www.stepladder.app)**
   - Add a CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

3. **Wait for DNS propagation** (5-60 minutes)
4. **SSL Certificate**: Vercel automatically provisions SSL certificates via Let's Encrypt

### Step 4: Update Supabase Settings

1. **Add allowed origins** in Supabase:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your production URL: `https://yourdomain.com`
   - Add your Vercel preview URL: `https://your-project.vercel.app`

2. **Update RLS policies** if needed (should work automatically)

### Step 5: Update Email Configuration

1. **Verify domain in Resend** (if using Resend):
   - Go to Resend Dashboard → Domains
   - Add your domain
   - Add DNS records as instructed
   - Update `EMAIL_FROM` in Vercel environment variables

2. **Update `NEXT_PUBLIC_APP_URL`** in Vercel:
   - Set to your production domain: `https://yourdomain.com`

## Alternative: Self-Hosted (VPS/Docker)

If you prefer self-hosting:

### Option 1: Docker + Docker Compose

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker
}

module.exports = nextConfig
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - EMAIL_FROM=${EMAIL_FROM}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    restart: unless-stopped
```

### Option 2: PM2 on VPS

1. **Set up server** (Ubuntu/Debian):
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone and build**:
   ```bash
   git clone https://github.com/yourusername/stepladder.git
   cd stepladder
   npm install
   npm run build
   ```

3. **Create `.env` file** with production variables

4. **Start with PM2**:
   ```bash
   pm2 start npm --name "stepladder" -- start
   pm2 save
   pm2 startup
   ```

5. **Set up Nginx reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Set up SSL with Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

## Domain Registrar Setup

### Common Registrars:

**Namecheap**:
1. Go to Domain List → Manage → Advanced DNS
2. Add A record: `@` → `76.76.21.21` (Vercel IP)
3. Add CNAME: `www` → `cname.vercel-dns.com`

**Cloudflare**:
1. Add site → Add DNS records
2. A record: `@` → `76.76.21.21`
3. CNAME: `www` → `cname.vercel-dns.com`
4. Set proxy status to "DNS only" (gray cloud) initially

**Google Domains**:
1. DNS → Custom name servers (or use default)
2. Add A record: `@` → `76.76.21.21`
3. Add CNAME: `www` → `cname.vercel-dns.com`

## Post-Deployment Checklist

- [ ] Environment variables set in production
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] Domain DNS configured correctly
- [ ] SSL certificate active (check for 🔒 in browser)
- [ ] Supabase allowed origins updated
- [ ] Email domain verified (if using Resend)
- [ ] Test signup/login flow
- [ ] Test client magic link access
- [ ] Test worksheet assignment emails
- [ ] Monitor error logs in Vercel dashboard

## Troubleshooting

**Domain not resolving**:
- Check DNS propagation: https://dnschecker.org
- Verify DNS records are correct
- Wait up to 48 hours for full propagation

**SSL certificate issues**:
- Vercel: Usually auto-resolves within minutes
- Self-hosted: Check Certbot logs, ensure port 80/443 open

**Environment variables not working**:
- Restart deployment in Vercel
- Verify variable names match exactly (case-sensitive)
- Check for typos in `NEXT_PUBLIC_` prefix

**Build failures**:
- Check build logs in Vercel dashboard
- Test build locally: `npm run build`
- Ensure all dependencies are in `package.json`

## Monitoring & Analytics

Consider adding:
- **Vercel Analytics**: Built-in, free tier available
- **Sentry**: Error tracking (free tier available)
- **PostHog/Mixpanel**: Product analytics
- **Uptime monitoring**: UptimeRobot, Pingdom

## Cost Estimates

**Vercel**:
- Hobby (Free): 100GB bandwidth/month, unlimited deployments
- Pro ($20/mo): 1TB bandwidth, team features

**Supabase**:
- Free tier: 500MB database, 2GB bandwidth
- Pro ($25/mo): 8GB database, 50GB bandwidth

**Resend**:
- Free: 3,000 emails/month
- Pro ($20/mo): 50,000 emails/month

**Domain**:
- ~$10-15/year for `.com` domains

## Recommended Stack for Production

1. **Hosting**: Vercel (easiest) or Railway/Render
2. **Database**: Supabase (PostgreSQL)
3. **Email**: Resend or SendGrid
4. **Domain**: Namecheap, Cloudflare, or Google Domains
5. **Monitoring**: Vercel Analytics + Sentry

