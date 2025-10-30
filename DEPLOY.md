# Deployment Guide

## Deploy to GitHub

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `402-token-explorer` (or your preferred name)
3. Don't initialize with README (we already have one)

### 2. Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: 402 Token Explorer"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/402-token-explorer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## Deploy to Render

### Prerequisites
- GitHub repository created (see above)
- Render account ([render.com](https://render.com))

### Step-by-Step Deployment

#### 1. Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** button
3. Select **"Web Service"**

#### 2. Connect Repository

1. Click **"Connect a repository"**
2. Authorize Render to access your GitHub
3. Select your `402-token-explorer` repository

#### 3. Configure Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `402-token-explorer` (or your choice) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free (or your preference) |

#### 4. Environment Variables (Optional)

No environment variables are required! The app works out of the box.

If you want to customize:
- `PORT` - Render auto-sets this, don't override
- `NODE_ENV` - Auto-set to `production`

#### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Start the server
3. Wait 2-5 minutes for initial deployment
4. Your app will be live at `https://your-service-name.onrender.com`

### Health Check Settings

Render auto-configures health checks. If you need custom settings:

- **Health Check Path**: `/` (default)
- **Health Check Interval**: 30 seconds

### Automatic Deploys

Every time you push to `main` branch on GitHub, Render will automatically:
1. Pull the latest code
2. Rebuild the application
3. Deploy the new version

To disable auto-deploy: Go to Settings → Build & Deploy → Auto-Deploy: OFF

---

## Verify Deployment

After deployment, test your live app:

1. Visit your Render URL
2. Verify tokens load (will use Jupiter API in production)
3. Test search functionality
4. Toggle dark/light mode
5. Click Dexscreener links
6. Test on mobile

---

## Troubleshooting

### Build Fails

**Error**: `npm install` fails
- **Solution**: Make sure `package.json` and `package-lock.json` are committed to GitHub

**Error**: Build runs out of memory
- **Solution**: Upgrade to paid instance (Free tier has limited RAM)

### App Won't Start

**Error**: Port binding issues
- **Solution**: Ensure your code uses `process.env.PORT` (already configured in this app)

**Error**: 503 Service Unavailable
- **Solution**: Check Render logs for errors, make sure build completed successfully

### No Tokens Showing

**Error**: Jupiter API blocked
- **Solution**: Check Render logs, may need to whitelist outbound connections (usually automatic)

**Error**: Network timeout
- **Solution**: Jupiter API might be down temporarily, app will fall back to demo data

---

## Custom Domain (Optional)

### Add Custom Domain to Render

1. Go to your service in Render Dashboard
2. Click **Settings** → **Custom Domains**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `tokens.yourdomain.com`)
5. Add CNAME record to your DNS:
   ```
   CNAME tokens.yourdomain.com → your-service-name.onrender.com
   ```
6. Wait for DNS propagation (5-60 minutes)
7. Render will auto-provision SSL certificate

---

## Performance Optimization

### Free Tier Limitations

Render's free tier spins down after 15 minutes of inactivity:
- First request after sleep takes ~30 seconds
- Subsequent requests are fast

**Workaround**: 
- Upgrade to paid plan ($7/month) for always-on service
- Or use a service like [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes

### Caching

The app already includes:
- 5-minute server-side token data cache
- React Query client-side caching
- Proper HTTP cache headers

---

## Monitoring

### View Logs

1. Go to Render Dashboard
2. Click your service
3. Click **Logs** tab
4. See real-time logs

**Useful log messages:**
```
Fetching tokens from Jupiter API...
Found X tokens matching 402/x402
Returning cached token data
```

### Metrics

Render provides:
- CPU usage
- Memory usage  
- Bandwidth
- Response times

Access via **Metrics** tab in dashboard

---

## Update Your App

### Make Changes

```bash
# Make your code changes
git add .
git commit -m "Description of changes"
git push origin main
```

Render will automatically detect the push and redeploy!

### Manual Deploy

If auto-deploy is off:
1. Go to Render Dashboard
2. Click your service
3. Click **Manual Deploy** → Deploy latest commit

---

## Cost Estimate

### Free Tier
- ✅ 750 hours/month free
- ✅ Auto-sleep after 15 min inactivity
- ✅ SSL included
- ✅ Perfect for this project

### Paid Options
- **Starter**: $7/month - Always on, faster
- **Standard**: $25/month - More resources

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **GitHub Issues**: Create issue in your repository

---

**Your 402 Token Explorer is now live! 🚀**
