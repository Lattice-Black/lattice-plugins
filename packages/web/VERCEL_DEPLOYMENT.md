# Deploying Lattice Web Dashboard to Vercel

This guide walks through deploying the Lattice web dashboard to Vercel.

## Prerequisites

- Vercel account (free tier works)
- GitHub repository connected to Vercel
- Railway API deployed (for production API URL)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js application

### 2. Configure Project Settings

When importing the project:

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `packages/web` (IMPORTANT: Must point to the web package)

**Build & Development Settings**:
- Build Command: `yarn build` (or leave default)
- Output Directory: `.next` (default)
- Install Command: `yarn install` (or leave default)
- Development Command: `yarn dev` (or leave default)

### 3. Set Environment Variables

In Vercel project settings, go to **Settings > Environment Variables** and add:

```
NEXT_PUBLIC_API_URL
```

**Value**: Your production Railway API URL (after API is deployed)

Example: `https://lattice-api-production.up.railway.app/api/v1`

**Important**:
- Set this for **Production**, **Preview**, and **Development** environments
- You'll need to update this after deploying the API to Railway

### 4. Deploy

Click "Deploy" - Vercel will:
1. Clone your repository
2. Install dependencies
3. Build the Next.js application
4. Deploy to their edge network

First deployment takes 2-3 minutes.

### 5. Configure Custom Domain (Optional)

If you have a custom domain in Vercel:

1. Go to **Settings > Domains**
2. Add your domain (e.g., `lattice.yourdomain.com` or `www.yourdomain.com`)
3. Follow Vercel's DNS configuration instructions
4. SSL certificate is automatically provisioned

### 6. Update API URL After Railway Deployment

After deploying the API to Railway (next step):

1. Get the Railway production URL (e.g., `https://lattice-api-production.up.railway.app`)
2. Update `NEXT_PUBLIC_API_URL` in Vercel environment variables
3. Redeploy the dashboard (Settings > Deployments > Redeploy)

## Monorepo Configuration

Since this is a monorepo, ensure:

1. **Root Directory** is set to `packages/web` in Vercel project settings
2. Vercel can access the root `node_modules` if using workspaces

If you encounter dependency issues, you may need to adjust the Install Command to:
```bash
cd ../.. && yarn install && cd packages/web
```

## Automatic Deployments

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On pull requests and other branches

You can configure this in **Settings > Git**.

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://lattice-api-production.up.railway.app/api/v1` |

**Note**: All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets here.

## Verifying Deployment

After deployment:

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Check that the dashboard loads
3. Once API is deployed, verify that services appear in the dashboard

## Troubleshooting

### Build Fails with "Module not found"

**Issue**: Monorepo dependencies not resolving

**Solution**: Adjust the Install Command in Vercel settings:
```bash
cd ../.. && yarn install && cd packages/web
```

### Dashboard loads but shows "Failed to fetch services"

**Issue**: API URL is incorrect or API is not deployed

**Solution**:
1. Check `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. Ensure Railway API is deployed and accessible
3. Check CORS settings in API to allow your Vercel domain

### Changes not reflecting after commit

**Issue**: Vercel deployment not triggering

**Solution**:
1. Check **Settings > Git** to ensure automatic deployments are enabled
2. Manually trigger deployment from Vercel dashboard

## Production Checklist

Before going live:

- [ ] Root directory set to `packages/web`
- [ ] Environment variable `NEXT_PUBLIC_API_URL` configured
- [ ] Custom domain configured (if applicable)
- [ ] Railway API deployed and accessible
- [ ] CORS configured in API to allow Vercel domain
- [ ] Test dashboard can fetch data from production API
- [ ] SSL certificate provisioned (automatic with Vercel)

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Vercel (Web Dashboard)            │
│   - Next.js SSR/SSG                 │
│   - React components                │
│   - Static assets                   │
│   - Edge network CDN                │
└──────────────┬──────────────────────┘
               │
               │ HTTPS API calls
               │ (NEXT_PUBLIC_API_URL)
               ▼
┌─────────────────────────────────────┐
│   Railway (API Backend)             │
│   - Express.js API                  │
│   - Authentication                  │
│   - Billing/Stripe webhooks         │
│   - Service ingestion               │
└─────────────────────────────────────┘
```

## Next Steps

After Vercel deployment is complete:

1. ✅ Web dashboard deployed to Vercel
2. 🔜 Deploy API to Railway
3. 🔜 Update `NEXT_PUBLIC_API_URL` in Vercel
4. 🔜 Test end-to-end integration
5. 🔜 Configure custom domain (optional)

---

**Support**: [Vercel Documentation](https://vercel.com/docs)
