# Clerk Admin Account Setup

## Step 1: Create Admin Account in Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your project (or the one matching your `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`)
3. Go to "Users" in the sidebar
4. Click "Create user"
5. Fill in the details:
   - **Email**: `admin@test.com`
   - **Password**: `admin123`
   - **First name**: Admin
   - **Last name**: User

## Step 2: Verify Environment Variables

Make sure these are set in your Vercel project:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Z2VuZXJvdXMtcG9zc3VtLTY2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_YIs3iTmMEzOBBK5IJ41jlsT09y1ggPH8VYKWUazc0X
```

## Step 3: Test Login

1. **Local**: http://localhost:3011/admin/login
2. **Production**: https://choi-pd-ecosystem-l4kjszfzd-myaji35s-projects.vercel.app/admin/login

Use credentials:
- Email: `admin@test.com`
- Password: `admin123`

## Alternative: Sign Up Directly

You can also create an account directly from the login page by clicking "Sign up" and using any email/password combination.

## Important Notes

- Clerk automatically handles email verification (you can disable this in Clerk Dashboard → Email & SMS → Email settings)
- For production, you should set up a real email service in Clerk Dashboard
- The test credentials only work if you manually create the user in Clerk Dashboard first
