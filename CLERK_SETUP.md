# Clerk Authentication Setup Guide

This guide explains how to set up Clerk authentication for the Ghana Insider DE admin panel.

## Why Clerk?

- 🔐 **Secure authentication** without managing passwords
- 🚀 **Quick setup** - ready in minutes
- 👤 **User management** built-in
- 📧 **Email verification** included
- 🔑 **Multi-factor authentication** support
- 🎨 **Customizable** UI components

## Admin Panel URL

⚠️ **IMPORTANT**: The admin panel is located at a unique, secure URL:
```
https://ghanainsider.com/de/desk-3h9w2r
```

**Keep this URL private!** Only share it with authorized administrators.

## Setup Steps

### 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up for a free account
3. Create a new application
4. Name it: "Ghana Insider DE"

### 2. Get Your API Keys

In your Clerk dashboard:

1. Go to **API Keys** section
2. Copy your keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/de/desk-3h9w2r/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/de/desk-3h9w2r/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/de/desk-3h9w2r
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/de/desk-3h9w2r
```

### 4. Install Dependencies

```bash
npm install
```

This installs `@clerk/nextjs` package that was added to package.json.

### 5. Configure Clerk Dashboard

In your Clerk dashboard:

#### A. Set Redirect URLs

Go to **Paths** section and configure:

- **Sign-in URL**: `/de/desk-3h9w2r/sign-in`
- **Sign-up URL**: `/de/desk-3h9w2r/sign-up`
- **After sign-in**: `/de/desk-3h9w2r`
- **After sign-up**: `/de/desk-3h9w2r`

#### B. Configure Allowed Redirect URLs

Add these URLs to your allowed list:
```
http://localhost:3000/de/desk-3h9w2r
https://ghanainsider.com/de/desk-3h9w2r
```

#### C. Enable Email Authentication

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address**
3. Enable **Email verification**

### 6. Create Your First Admin User

#### Option 1: Via Clerk Dashboard
1. Go to **Users** section
2. Click **Create user**
3. Add admin email and set password

#### Option 2: Via Sign-Up Page
1. Visit `https://your-domain.com/de/desk-3h9w2r`
2. You'll be redirected to sign-in
3. Click "Sign up" and create account

⚠️ **For production**: Disable public sign-ups and manually invite admins via Clerk dashboard.

## Security Best Practices

### 1. Disable Public Sign-Ups (Production)

In Clerk dashboard:
1. Go to **Settings** → **Restrictions**
2. Enable **Allowlist**
3. Add admin email addresses manually
4. This prevents unauthorized sign-ups

### 2. Enable Multi-Factor Authentication

Recommended for extra security:
1. Go to **User & Authentication** → **Multi-factor**
2. Enable **SMS** or **Authenticator app**
3. Require for all users

### 3. Set Session Duration

1. Go to **Settings** → **Sessions**
2. Set appropriate timeout (e.g., 7 days)
3. Enable **Multi-session handling**

### 4. Monitor Sign-Ins

Regularly check **Users** section for:
- Suspicious login attempts
- Unknown users
- Unusual activity

## Testing Locally

1. Start development server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/de/desk-3h9w2r`

3. You should see Clerk sign-in page

4. Sign in with your admin account

5. You should be redirected to admin dashboard

## Troubleshooting

### "Invalid Publishable Key" Error

**Solution**: Double-check your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in `.env.local`

### Sign-in Page Shows 404

**Solution**:
1. Make sure middleware is properly configured
2. Check that paths in Clerk dashboard match exactly
3. Restart dev server after changing env variables

### Infinite Redirect Loop

**Solution**:
1. Verify redirect URLs in Clerk dashboard
2. Make sure `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` is correct
3. Clear browser cookies and try again

### User Can't Access Admin After Sign-In

**Solution**:
1. Check middleware configuration in `src/middleware.ts`
2. Verify route protection is working
3. Check browser console for errors

## Files Modified

- `package.json` - Added @clerk/nextjs dependency
- `src/middleware.ts` - Route protection
- `src/app/layout.tsx` - ClerkProvider wrapper
- `src/app/de/desk-3h9w2r/layout.tsx` - UserButton component
- `.env.example` - Environment variable template

## What Happens When User Visits Admin?

1. User goes to `/de/desk-3h9w2r`
2. Middleware checks authentication
3. If not signed in → redirect to `/de/desk-3h9w2r/sign-in`
4. User signs in with Clerk
5. Clerk verifies credentials
6. User redirected to `/de/desk-3h9w2r` (dashboard)
7. UserButton shows in top-right (profile/sign-out)

## Support

- **Clerk Docs**: https://clerk.com/docs
- **Clerk Support**: support@clerk.com
- **Next.js + Clerk**: https://clerk.com/docs/quickstarts/nextjs

## Production Checklist

Before deploying to production:

- [ ] Switch from `pk_test_` to `pk_live_` keys
- [ ] Switch from `sk_test_` to `sk_live_` keys
- [ ] Add production domain to allowed URLs
- [ ] Enable allowlist (disable public sign-ups)
- [ ] Create admin accounts via Clerk dashboard
- [ ] Enable multi-factor authentication
- [ ] Set appropriate session duration
- [ ] Test sign-in/sign-out flow
- [ ] Monitor usage in Clerk dashboard

## Cost

Clerk pricing (as of 2024):
- **Free tier**: Up to 10,000 monthly active users
- **Pro**: $25/month for advanced features
- **Enterprise**: Custom pricing

For a single admin panel, the **free tier is sufficient**.

---

**Remember**: Never commit `.env.local` to version control!
