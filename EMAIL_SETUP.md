# Email Service Setup Guide

This guide explains how to integrate a real email service provider to enable sending worksheet emails to clients.

## Quick Start with Resend (Recommended)

Resend is a modern, developer-friendly email API that's easy to set up and has a generous free tier.

### Step 1: Sign Up for Resend

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your API Key

1. Go to the [Resend Dashboard](https://resend.com/api-keys)
2. Click "Create API Key"
3. Give it a name (e.g., "StepLadder Production")
4. Copy the API key (you'll only see it once!)

### Step 3: Verify Your Domain (Required for Production)

1. Go to [Domains](https://resend.com/domains) in the Resend dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `stepladder.app`)
4. Add the DNS records Resend provides to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

**Note:** For testing, you can use Resend's test domain, but emails will be limited.

### Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Resend API Key (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# Email sender address (must match your verified domain)
EMAIL_FROM=StepLadder <noreply@yourdomain.com>
```

**Example for development:**
```bash
RESEND_API_KEY=re_abc123xyz789
EMAIL_FROM=StepLadder <noreply@stepladder.app>
```

### Step 5: Test It Out

1. Start your development server: `npm run dev`
2. Navigate to a client's worksheet page
3. Click "Email to Client"
4. Confirm the dialog
5. Check the Resend dashboard's [Logs](https://resend.com/emails) to see if the email was sent

## Alternative Email Providers

### SendGrid

1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Update `src/lib/email.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await sgMail.send({
      from: process.env.EMAIL_FROM || 'noreply@stepladder.app',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
```

### AWS SES

1. Set up AWS SES in your AWS account
2. Verify your domain/email
3. Create IAM credentials
4. Update `src/lib/email.ts`:

```typescript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM || 'noreply@stepladder.app',
      Destination: { ToAddresses: [options.to] },
      Message: {
        Subject: { Data: options.subject },
        Body: {
          Html: { Data: options.html },
          Text: { Data: options.text || options.subject },
        },
      },
    });
    await sesClient.send(command);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
```

### Nodemailer (SMTP)

For custom SMTP servers (Gmail, Outlook, custom mail server):

1. Install nodemailer: `npm install nodemailer`
2. Update `src/lib/email.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@stepladder.app',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
```

## Development Mode

If `RESEND_API_KEY` is not set, the email service will:
- Log email details to the console
- Return `true` in development mode (so UI flows work)
- Return `false` in production mode (to indicate email wasn't sent)

This allows you to develop and test the feature without configuring email immediately.

## Troubleshooting

### Emails not sending?

1. **Check API key**: Make sure `RESEND_API_KEY` is set correctly in `.env.local`
2. **Check domain**: Ensure your domain is verified in Resend
3. **Check logs**: Look at Resend dashboard → Emails → Logs for error messages
4. **Check console**: Look for error messages in your server logs

### Common Errors

- **"Invalid API key"**: Your `RESEND_API_KEY` is incorrect or missing
- **"Domain not verified"**: You need to verify your domain in Resend
- **"Rate limit exceeded"**: You've hit Resend's rate limits (check your plan)
- **"Invalid from address"**: Your `EMAIL_FROM` doesn't match a verified domain

### Testing Email Locally

1. Use Resend's test mode (emails won't actually send but API calls will work)
2. Use a service like [Mailtrap](https://mailtrap.io) to catch test emails
3. Use Resend's test API key (found in dashboard)

## Security Best Practices

1. **Never commit API keys**: Always use `.env.local` (which is gitignored)
2. **Use environment-specific keys**: Different keys for dev/staging/production
3. **Rotate keys regularly**: Change API keys periodically
4. **Monitor usage**: Check Resend dashboard for unusual activity
5. **Set up alerts**: Configure Resend to alert on failures or rate limits

## Cost Considerations

- **Resend Free Tier**: 3,000 emails/month, 100 emails/day
- **Resend Pro**: $20/month for 50,000 emails/month
- **SendGrid Free**: 100 emails/day forever
- **AWS SES**: $0.10 per 1,000 emails (very cheap at scale)

For most therapist practices, the free tiers should be sufficient.

