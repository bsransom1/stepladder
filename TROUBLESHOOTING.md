# Troubleshooting Auth Issues

## Common Issues and Solutions

### 1. "Invalid email or password" on login

**Possible causes:**
- Database not set up correctly
- Migration not run
- Email/password mismatch

**Solutions:**
- Verify your Supabase connection in `.env.local`
- Check that the `therapists` table exists in Supabase
- Verify the migration was run successfully
- Check browser console and server logs for detailed errors

### 2. "Database error" or connection issues

**Possible causes:**
- Missing environment variables
- Incorrect Supabase credentials
- Network issues

**Solutions:**
- Verify `.env.local` has all required variables:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  JWT_SECRET=your_secret
  ```
- Check Supabase dashboard to verify project is active
- Test connection in Supabase SQL Editor

### 3. "No token received" after signup/login

**Possible causes:**
- JWT_SECRET not set
- Token generation failed
- Response parsing error

**Solutions:**
- Set `JWT_SECRET` in `.env.local` (use a secure random string)
- Check server logs for errors
- Verify the API response contains a token

### 4. "Unauthorized" on protected routes

**Possible causes:**
- Token expired or invalid
- Token not being sent in headers
- JWT_SECRET mismatch

**Solutions:**
- Clear localStorage: `localStorage.removeItem('auth_token')`
- Log in again
- Verify JWT_SECRET is the same across restarts
- Check browser Network tab to see if Authorization header is sent

### 5. Environment variables not loading

**Possible causes:**
- File named incorrectly (should be `.env.local`)
- Server not restarted after adding variables
- Variables not prefixed correctly

**Solutions:**
- Ensure file is named `.env.local` (not `.env`)
- Restart dev server after adding variables
- `NEXT_PUBLIC_*` vars are for client-side, others are server-only
- Check that variables are in root directory

## Debugging Steps

1. **Check environment variables:**
   ```bash
   # In your terminal, verify vars are loaded (they won't show values for security)
   node -e "console.log(process.env.JWT_SECRET ? 'JWT_SECRET: Set' : 'JWT_SECRET: Missing')"
   ```

2. **Check database connection:**
   - Go to Supabase dashboard
   - Open SQL Editor
   - Run: `SELECT * FROM therapists LIMIT 1;`
   - Should return empty result or existing therapists

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

4. **Check server logs:**
   - Look at terminal where `npm run dev` is running
   - Check for error messages
   - Look for database connection errors

5. **Test API directly:**
   ```bash
   # Test signup endpoint
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test1234","name":"Test User"}'
   ```

## Getting Help

If issues persist:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure database migrations have been run
4. Test with a fresh Supabase project if needed

