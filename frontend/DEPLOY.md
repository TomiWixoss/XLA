# Deploy Frontend to Vercel/Netlify

## Configuration

### Environment Variables

Create `.env.local` file:

```bash
# Production API (Render)
NEXT_PUBLIC_API_URL=https://xla-qzs2.onrender.com

# Or for local development
# NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deploy to Vercel

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure frontend for production"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Environment Variables**
   Add in Vercel dashboard:
   - `NEXT_PUBLIC_API_URL` = `https://xla-qzs2.onrender.com`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Auto Deploy

Vercel auto-deploys on every push to `main` branch.

## Deploy to Netlify

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure frontend for production"
   git push origin main
   ```

2. **Import to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository
   - Configure:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/.next`

3. **Environment Variables**
   Add in Netlify dashboard:
   - `NEXT_PUBLIC_API_URL` = `https://xla-qzs2.onrender.com`

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy automatically

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## Update Backend URL

If backend URL changes, update:

1. **`.env.local`** (local development)
2. **Vercel/Netlify Environment Variables** (production)
3. Redeploy frontend

## Troubleshooting

### CORS Errors

Make sure backend allows your frontend domain:
- Backend should have your frontend URL in CORS config
- Check backend logs on Render

### API Not Responding

- Check if backend is awake (Render free tier spins down)
- Visit backend health check: https://xla-qzs2.onrender.com/health
- Wait 30-60 seconds for cold start

### Build Fails

- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs in Vercel/Netlify

## Production URLs

After deployment:
- **Frontend**: `https://your-app.vercel.app` or `https://your-app.netlify.app`
- **Backend**: `https://xla-qzs2.onrender.com`
- **Backend Health**: `https://xla-qzs2.onrender.com/health`
- **Backend Docs**: `https://xla-qzs2.onrender.com/docs`

## Keep Backend Alive

Since Render free tier spins down after 15 minutes:

1. Use UptimeRobot to ping `/health` every 10 minutes
2. Or accept 30-60s cold start on first request
3. Or upgrade to Render paid plan ($7/month)
