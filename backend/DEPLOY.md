# Deploy Backend to Render

## Quick Deploy

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare backend for Render deployment"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name**: `pystegowatermark-api`
     - **Region**: Singapore (or closest to you)
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: Python 3
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

3. **Environment Variables** (Optional)
   - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-app.vercel.app`)
   - `PYTHON_VERSION`: `3.11.0`

4. **Health Check**
   - Render will automatically use `/health` endpoint
   - Monitor status at: `https://your-api.onrender.com/health`

## Endpoints

- **Root**: `https://your-api.onrender.com/`
- **Health**: `https://your-api.onrender.com/health`
- **Docs**: `https://your-api.onrender.com/docs`
- **Steganography**: `https://your-api.onrender.com/api/steganography`
- **Watermarking**: `https://your-api.onrender.com/api/watermarking`
- **Video**: `https://your-api.onrender.com/api/video`

## Important Notes

### Free Tier Limitations
- **Spin down after 15 minutes of inactivity**
- **Cold start**: ~30-60 seconds on first request
- **750 hours/month free**

### Keep Service Alive (Optional)
Use a monitoring service to ping `/health` every 10 minutes:
- [UptimeRobot](https://uptimerobot.com/) (Free)
- [Cron-job.org](https://cron-job.org/) (Free)
- [Better Uptime](https://betteruptime.com/) (Free tier)

### CORS Configuration
The backend is configured to accept requests from:
- `localhost:3000` (development)
- `*.vercel.app` (Vercel deployments)
- `*.netlify.app` (Netlify deployments)
- `*.render.com` (Render deployments)
- Custom domain via `FRONTEND_URL` env var

## Troubleshooting

### Build Fails
- Check Python version in `runtime.txt`
- Verify all dependencies in `requirements.txt`
- Check Render build logs

### Service Crashes
- Check Render logs
- Verify `PORT` environment variable is used
- Check memory usage (Free tier: 512MB)

### CORS Errors
- Add your frontend URL to `FRONTEND_URL` environment variable
- Check browser console for exact error

## Local Testing

Test the production setup locally:

```bash
cd backend
pip install -r requirements.txt
PORT=8000 uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Visit:
- http://localhost:8000/
- http://localhost:8000/health
- http://localhost:8000/docs

## Monitoring

After deployment, monitor your service:
- **Render Dashboard**: Check logs, metrics, and events
- **Health Endpoint**: `curl https://your-api.onrender.com/health`
- **API Docs**: Visit `/docs` for interactive API testing

## Update Deployment

Render auto-deploys on git push:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will automatically:
1. Pull latest code
2. Run build command
3. Restart service
4. Run health checks
