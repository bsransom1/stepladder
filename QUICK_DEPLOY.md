# Quick Deploy Guide

**Fastest path to production**: Deploy to Vercel and connect your domain.

## 5-Minute Deploy

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/stepladder.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "Add New Project" → Import your repository
3. Click "Deploy" (uses defaults)

### 3. Add Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_random_secret
RESEND_API_KEY=your_resend_key
EMAIL_FROM=StepLadder <noreply@yourdomain.com>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Important**: After adding variables, redeploy (Settings → Deployments → Redeploy)

### 4. Connect Domain
1. Vercel Dashboard → Project → Settings → Domains → Add Domain
2. Enter your domain: `stepladder.app`
3. Add DNS record at your registrar:
   - **A record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
4. Wait 5-60 minutes for DNS propagation
5. SSL certificate auto-provisions

### 5. Update Supabase
Supabase Dashboard → Authentication → URL Configuration:
- Add: `https://yourdomain.com`
- Add: `https://your-project.vercel.app`

### 6. Update Resend (if using)
1. Resend Dashboard → Domains → Add Domain
2. Add DNS records as shown
3. Update `EMAIL_FROM` in Vercel env vars

## Done! 🎉

Your app is live at `https://yourdomain.com`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions and alternatives.

