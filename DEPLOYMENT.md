# Deployment Guide for shopqnb.com

## Prerequisites
- GitHub account
- Railway account (railway.app)
- Vercel account (vercel.com)
- Domain: shopqnb.com (already secured)

## Step 1: Deploy Backend to Railway

### 1.1 Prepare Backend Repository
1. Push your code to GitHub if not already done
2. Ensure all files are committed:
   - `backend/main.py` (updated with CORS)
   - `backend/requirements.txt`
   - `backend/railway.json`
   - `backend/Procfile`

### 1.2 Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Set the root directory to `backend/`
6. Railway will automatically detect it's a Python app
7. Add environment variables:
   - `GROK_API_KEY` (your Grok API key)
   - `WALMART_API_KEY` (if you have one)
   - `AMAZON_API_KEY` (if you have one)

### 1.3 Get Railway URL
- After deployment, Railway will provide a URL like: `https://your-app-name.up.railway.app`
- Copy this URL for the next step

## Step 2: Deploy Frontend to Vercel

### 2.1 Update Frontend Configuration
1. Update `frontend/src/config.js`:
   ```javascript
   const config = {
     development: {
       apiUrl: 'http://localhost:8000'
     },
     production: {
       apiUrl: 'https://your-railway-app.up.railway.app' // Replace with your Railway URL
     }
   };
   ```

### 2.2 Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Set the root directory to `frontend/`
6. Vercel will automatically detect it's a React app
7. Add environment variable:
   - `REACT_APP_API_URL`: `https://your-railway-app.up.railway.app`

### 2.3 Configure Custom Domain
1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add `shopqnb.com`
4. Follow DNS configuration instructions

## Step 3: Configure DNS

### 3.1 Domain Provider Settings
Add these DNS records to your domain provider:

**For Vercel (Frontend):**
- Type: A
- Name: @
- Value: 76.76.19.19

- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

**For Railway (Backend) - Optional:**
- Type: CNAME
- Name: api
- Value: your-railway-app.up.railway.app

## Step 4: Environment Variables

### Backend (Railway)
```
GROK_API_KEY=your_grok_api_key_here
WALMART_API_KEY=your_walmart_api_key_here
AMAZON_API_KEY=your_amazon_api_key_here
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
```

## Step 5: Testing

### 5.1 Test Backend
- Visit: `https://your-railway-app.up.railway.app/`
- Should return: `{"message": "Query and Buy API is running"}`

### 5.2 Test Frontend
- Visit: `https://shopqnb.com`
- Should load the React app
- Test search functionality

### 5.3 Test API Integration
- Open browser dev tools
- Check Network tab for API calls
- Verify calls go to Railway URL

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure Railway URL is in CORS allow_origins
2. **API 404**: Check Railway deployment logs
3. **Domain not loading**: Wait 24-48 hours for DNS propagation
4. **Environment variables**: Double-check all API keys are set

### Railway Logs:
- Go to Railway dashboard → your app → "Deployments"
- Click on latest deployment → "View Logs"

### Vercel Logs:
- Go to Vercel dashboard → your project → "Functions"
- Check for any build errors

## Cost Estimation
- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (unlimited)
- **Domain**: ~$10-15/year
- **Total**: ~$10-15/year initially

## Next Steps
1. Set up monitoring (Railway/Vercel provide basic monitoring)
2. Configure custom error pages
3. Set up database when ready (Supabase recommended)
4. Add analytics (Google Analytics, Vercel Analytics) 