# 🚀 TradeSense AI Deployment Guide

## Vercel (Frontend) + Fly.io (Backend)

This guide will walk you through deploying your TradeSense AI application using **100% free hosting**:

- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Fly.io (Flask + PostgreSQL)

---

## 📋 Pre-Deployment Checklist

Before starting, make sure you have:

- [ ] GitHub account with your code pushed to a repository
- [ ] [Fly.io account](https://fly.io/app/sign-up) (free tier)
- [ ] [Vercel account](https://vercel.com/signup) (free tier)
- [ ] Fly.io CLI installed (we'll do this in Step 1)
- [ ] Google API Key for Gemini AI
- [ ] All sensitive data removed from your code (use environment variables)

---

## 🔧 Part 1: Deploy Backend to Fly.io

### Step 1: Install Fly.io CLI

**Windows (PowerShell):**

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify installation:**

```powershell
fly version
```

### Step 2: Login to Fly.io

```powershell
fly auth login
```

This will open your browser to authenticate.

### Step 3: Navigate to Backend Directory

```powershell
cd c:\Users\bobot\OneDrive\Bureau\Projet_TradeSens\backend
```

### Step 4: Launch Your App

> ⚠️ **Important**: The `fly.toml` file has been created for you. You may need to change the app name if "tradesense-backend" is taken.

```powershell
fly launch
```

You'll be asked several questions:

1. **Choose an app name**: Press Enter to use `tradesense-backend` (or choose a unique name)
2. **Choose a region**: Select the closest region (e.g., `cdg` for Paris)
3. **Would you like to set up a PostgreSQL database?**: Type `y` (YES)
   - Choose **Development** configuration (free tier)
4. **Would you like to set up an Upstash Redis database?**: Type `n` (NO)
5. **Would you like to deploy now?**: Type `n` (NO - we need to set secrets first)

### Step 5: Set Environment Variables (Secrets)

Set your required secrets:

```powershell
# Required secrets
fly secrets set SECRET_KEY="your-super-secret-key-change-this-12345"
fly secrets set JWT_SECRET_KEY="your-jwt-secret-key-change-this-67890"
fly secrets set GOOGLE_API_KEY="AIzaSyC1xgtrUiEymgv06z3QPn2RePGE9iQ1rR8"        

# Optional: PayPal (if you're using it)
fly secrets set PAYPAL_MODE="sandbox"
fly secrets set PAYPAL_CLIENT_ID="your-paypal-client-id"
fly secrets set PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
```

> 💡 **Tip**: Generate strong secret keys using:
>
> ```powershell
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

### Step 6: Update Database Configuration

Fly.io automatically sets the `DATABASE_URL` environment variable after creating PostgreSQL. Your Flask app will use it automatically.

**However**, you need to ensure your `app/config.py` reads from this variable. Check that it contains:

```python
DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///instance/tradesense.db')
```

If it uses PostgreSQL, you may need to install `psycopg2`:

**Add to `requirements.txt`:**

```
psycopg2-binary==2.9.9
```

### Step 7: Create Persistent Volume for Database (If Using SQLite)

If you prefer SQLite over PostgreSQL, create a volume:

```powershell
fly volumes create tradesense_data --size 1 --region cdg
```

This matches the mount configuration in `fly.toml`.

### Step 8: Deploy!

```powershell
fly deploy
```

This will:

1. Build your Docker image
2. Deploy to Fly.io
3. Run database migrations automatically
4. Start your Flask server

### Step 9: Verify Deployment

Check if your backend is running:

```powershell
fly open /api/health
```

You should see:

```json
{ "status": "healthy", "message": "TradeSense AI is running" }
```

**Get your backend URL:**

```powershell
fly info
```

Your backend URL will be: `https://tradesense-backend.fly.dev` (or your custom app name)

### Step 10: Monitor Logs (Optional)

```powershell
fly logs
```

---

## 🎨 Part 2: Deploy Frontend to Vercel

### Step 1: Push Code to GitHub

If you haven't already:

```powershell
cd c:\Users\bobot\OneDrive\Bureau\Projet_TradeSens
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Login to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up** or **Login**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your repositories

### Step 3: Import Your Project

1. Click **Add New...** → **Project**
2. Find your `Projet_TradeSens` repository
3. Click **Import**

### Step 4: Configure Build Settings

Vercel will auto-detect Next.js. Configure:

**Framework Preset:** Next.js (auto-detected)

**Root Directory:**

- Click **Edit** next to Root Directory
- Select `frontend`
- Click **Continue**

**Build & Development Settings:**

- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### Step 5: Set Environment Variables

Click **Environment Variables** and add:

| Name                  | Value                                |
| --------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | `https://tradesense-backend.fly.dev` |

> 🔔 **Replace** `tradesense-backend.fly.dev` with your actual Fly.io app URL from Part 1, Step 9

### Step 6: Deploy!

Click **Deploy**

Vercel will:

1. Install dependencies
2. Build your Next.js app
3. Deploy to global CDN
4. Give you a production URL

### Step 7: Get Your Frontend URL

After deployment completes (2-3 minutes), you'll see:

```
🎉 Your project is deployed!
https://projet-tradesens.vercel.app
```

> 💡 You can add a custom domain later in Vercel settings

---

## 🔗 Part 3: Connect Frontend & Backend

### Update CORS Settings

Your backend needs to allow requests from your Vercel domain.

**Option 1: Update in Code (Recommended)**

Edit `backend/app/__init__.py`:

```python
# Replace the CORS line (line 23) with:
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://projet-tradesens.vercel.app",  # Your Vercel URL
            "http://localhost:3000",  # Local development
            "http://localhost:5173"   # Alternative local port
        ],
        "supports_credentials": True
    }
})
```

**Then redeploy backend:**

```powershell
cd backend
fly deploy
```

**Option 2: Set via Environment Variable**

```powershell
fly secrets set FRONTEND_URL="https://projet-tradesens.vercel.app"
```

Then update your code to read from `os.environ.get('FRONTEND_URL')`.

---

## ✅ Part 4: Verify Everything Works

### Test Backend API

```powershell
curl https://tradesense-backend.fly.dev/api/health
```

Expected response:

```json
{ "status": "healthy", "message": "TradeSense AI is running" }
```

### Test Frontend

1. Visit your Vercel URL: `https://projet-tradesens.vercel.app`
2. Try to register a new user
3. Try to login
4. Check if market data loads
5. Verify dashboard displays correctly

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: App won't start**

```powershell
fly logs  # Check for errors
```

**Common fixes:**

- Check all environment variables are set: `fly secrets list`
- Verify database connection: `fly ssh console` → `python run.py`
- Check Dockerfile builds locally: `docker build -t test .`

**Problem: Database errors**

```powershell
fly ssh console
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

**Problem: Out of memory**

- Free tier has 256MB RAM
- Reduce workers in Dockerfile: `--workers 1`

### Frontend Issues

**Problem: "Failed to fetch" or API errors**

- Verify `NEXT_PUBLIC_API_URL` in Vercel dashboard
- Check CORS configuration in backend
- Ensure backend URL uses `https://` not `http://`

**Problem: Build fails**

```
Check build logs in Vercel dashboard
Verify package.json dependencies
Try building locally: npm run build
```

**Problem: Environment variables not working**

- Environment variables MUST start with `NEXT_PUBLIC_` to be accessible in browser
- Redeploy after changing env vars

### CORS Issues

If you see CORS errors in browser console:

1. Check backend logs: `fly logs`
2. Verify Vercel URL in CORS origins
3. Make sure `supports_credentials=True` is set
4. Ensure frontend uses correct API URL

---

## 📊 Monitoring & Maintenance

### Fly.io Commands

```powershell
fly status              # Check app status
fly logs                # View logs
fly ssh console         # SSH into your app
fly secrets list        # List environment variables
fly scale count 1       # Scale to 1 machine (free tier)
fly apps list           # List all your apps
```

### Vercel Commands

Visit your Vercel dashboard:

- View deployment logs
- Check analytics
- Manage environment variables
- Add custom domains

### Database Backups

**If using PostgreSQL on Fly.io:**

```powershell
fly postgres db list
fly postgres db backup <database-id>
```

**If using SQLite with volume:**

```powershell
fly ssh console
# Inside the container:
cp /app/instance/tradesense.db /app/instance/backup.db
```

---

## 💰 Cost Optimization

### Fly.io Free Tier Limits:

- ✅ Up to 3 shared-cpu-1x 256MB VMs
- ✅ 3GB persistent volume storage
- ✅ 160GB outbound data transfer/month

**To stay within free tier:**

- Set `auto_stop_machines = true` in `fly.toml` ✅ (already configured)
- Use 1 machine maximum
- Use PostgreSQL instead of SQLite (no volume needed)

### Vercel Free Tier Limits:

- ✅ 100GB bandwidth/month
- ✅ 100 deployments/day
- ✅ 12,000 serverless function executions/day

**You should be fine** unless you get viral traffic! 🚀

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Backend (Fly.io):**

```powershell
# Set up GitHub Actions
fly deploy --remote-only
```

Add this to `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

**Frontend (Vercel):**
Vercel automatically deploys on every push to `main` branch! ✅

---

## 🎉 You're Done!

Your TradeSense AI application is now live on:

- **Frontend**: `https://projet-tradesens.vercel.app`
- **Backend**: `https://tradesense-backend.fly.dev`

**Next steps:**

1. ✅ Add custom domain in Vercel settings
2. ✅ Set up monitoring (Sentry, LogRocket)
3. ✅ Configure email service (SendGrid, Resend)
4. ✅ Add analytics (Google Analytics, Plausible)

---

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Flask Production Best Practices](https://flask.palletsprojects.com/en/latest/deploying/)

---

## 🆘 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review Fly.io logs: `fly logs`
3. Check Vercel deployment logs in dashboard
4. Verify all environment variables are set correctly

**Common deployment checklist:**

- [ ] Backend health check passes
- [ ] Database connection works
- [ ] All secrets are set
- [ ] CORS is configured correctly
- [ ] Frontend can reach backend API
- [ ] Environment variables use correct URLs

Good luck! 🚀
