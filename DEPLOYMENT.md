# Deployment Guide: Todo Dashboard

This guide provides step-by-step instructions for deploying the Todo Dashboard application to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Supabase project with the database schema set up
- GitHub/GitLab/Bitbucket account (for connecting your repository)

## Deployment Options

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Configure environment variables**:
   Create a `.env.local` file with all required variables (see README.md)

5. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code** to a Git repository (GitHub, GitLab, or Bitbucket)

2. **Import your project** on Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." > "Project"
   - Import your Git repository

3. **Configure project settings**:
   - Framework Preset: Next.js
   - Root Directory: (leave blank if your project is at the root)
   - Build Command: `npm run build` or `yarn build`
   - Output Directory: `.next`
   - Install Command: `npm install` or `yarn install`

4. **Configure environment variables**:
   - Add all required environment variables from your `.env.local` file
   - Make sure to include:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your Vercel deployment URL)
     - Any OAuth credentials you're using

5. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically deploy your application

## Post-Deployment Steps

1. **Update OAuth Redirect URIs**:
   - Go to your Supabase project settings > Authentication > URL Configuration
   - Add your production URL to the "Site URL" and "Redirect URLs"
   - Example: `https://your-vercel-app.vercel.app`

2. **Configure Custom Domain (Optional)**:
   - In your Vercel project settings, go to "Domains"
   - Add your custom domain and follow the verification steps

3. **Set Up Environment Variables for Production**:
   - In Vercel project settings, go to "Environment Variables"
   - Add all required environment variables
   - Make sure to set `NODE_ENV` to `production`

## Environment Variables

Make sure to set these environment variables in your Vercel project:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-vercel-app.vercel.app

# Google OAuth (if enabled)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Verify all OAuth callback URLs are correctly set in your Supabase project
   - Ensure `NEXTAUTH_URL` is set to your production URL

2. **Environment Variables Not Loading**:
   - Check for typos in variable names
   - Make sure to redeploy after adding new environment variables

3. **Database Connection Issues**:
   - Verify your Supabase project is running
   - Check that Row Level Security (RLS) policies are properly set up

### Checking Logs

1. **Vercel Deployment Logs**:
   - Go to your project in Vercel
   - Click on the deployment
   - Check the "Logs" tab for any errors

2. **Application Logs**:
   - For runtime errors, check the browser console
   - For server-side errors, check the Vercel function logs

## CI/CD (Optional)

For automatic deployments on push to main branch:

1. Go to your Vercel project settings
2. Navigate to "Git"
3. Enable "Automatically deploy from this Git branch"
4. Select your main branch

## Monitoring

Vercel provides built-in monitoring:
- Go to the "Analytics" tab to monitor performance
- Check the "Logs" tab for serverless function logs
- Set up alerts in the "Monitoring" section

## Rollbacks

If a deployment causes issues:
1. Go to your project in Vercel
2. Click on the deployment history
3. Find a working deployment and click "Redeploy"

## Support

For additional help:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
