# Complete Deployment Guide - Trivia App on Render.com

This guide walks you through deploying your trivia app to **Render.com** for **FREE**, making it publicly accessible on the internet.

---

## 📋 **Overview**

Your app consists of:
- **Frontend**: React + Vite (client)
- **Backend**: Node.js + Express (server)
- **Database**: MongoDB
- **Backoffice**: Admin panel

We'll deploy all components to Render.com's free tier.

---

## 🎯 **Phase 1: Pre-Deployment Preparation**

### Step 1.1: Prepare Your Code for Production

Before deploying, you need to make a few changes to your codebase:

#### A. Create Production Environment Configuration

Create a new file: `server/.env.production` (you'll set these values in Render later):

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=<will-be-set-in-render>
JWT_SECRET=<will-be-set-in-render>
CLIENT_URL=<will-be-set-in-render>
```

#### B. Update Server Package.json

Ensure your `server/package.json` has the correct start script:

```json
{
  "scripts": {
    "start": "node dist/app.js",
    "build": "tsc"
  }
}
```

#### C. Update Client Build Configuration

Your `client/vite.config.ts` should already be configured, but verify it has:

```typescript
export default defineConfig({
  // ... other config
  build: {
    outDir: 'dist'
  }
})
```

#### D. Add Render Build Scripts

Create `render-build.sh` in the **root directory**:

```bash
#!/bin/bash
echo "Building server..."
cd server
npm install
npm run build
cd ..

echo "Building client..."
cd client
npm install
npm run build
cd ..

echo "Building backoffice..."
cd backoffice
npm install
npm run build
cd ..

echo "Build complete!"
```

Make it executable:
```bash
chmod +x render-build.sh
```

#### E. Update CORS Settings

In `server/src/app.ts` (or wherever CORS is configured), update to accept your production URL:

```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

## 🔐 **Phase 2: Set Up MongoDB Database**

You have two options for MongoDB - I recommend **MongoDB Atlas** (official MongoDB cloud):

### Option A: MongoDB Atlas (Recommended)

#### Step 2.1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Click **"Try Free"**
3. Sign up with:
   - Email address
   - Password
   - Or use **"Sign up with Google"** for faster setup

#### Step 2.2: Create a Free Cluster

1. After login, click **"Build a Database"**
2. Select **"M0 FREE"** tier (512 MB storage)
3. Choose a **Cloud Provider & Region**:
   - Provider: **AWS** (recommended)
   - Region: Choose the closest to your location (e.g., `us-east-1` for US East Coast)
4. Cluster Name: `trivia-cluster` (or any name you prefer)
5. Click **"Create Deployment"**

#### Step 2.3: Create Database User

1. **Security Quickstart** will appear
2. **Authentication Method**: Username and Password
3. **Username**: `trivia-admin` (or your choice)
4. **Password**: Click **"Autogenerate Secure Password"** - **SAVE THIS PASSWORD!**
5. Click **"Create Database User"**

#### Step 2.4: Set Up Network Access

1. Click **"Add entries to your IP Access List"**
2. **IMPORTANT**: Click **"Add My Current IP Address"**
3. Then **ALSO** click **"Allow Access from Anywhere"** (for Render to connect)
   - This adds `0.0.0.0/0` which allows connections from any IP
4. Click **"Finish and Close"**

#### Step 2.5: Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. **Driver**: Node.js
5. **Version**: 5.5 or later
6. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://trivia-admin:<password>@trivia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. **Replace `<password>`** with the password you saved earlier
8. **Add database name** before the `?`:
   ```
   mongodb+srv://trivia-admin:YourPassword@trivia-cluster.xxxxx.mongodb.net/trivia-production?retryWrites=true&w=majority
   ```

**SAVE THIS CONNECTION STRING!** You'll need it for Render.

---

### Option B: Render PostgreSQL (Alternative - Not Recommended for This App)

MongoDB is better suited for your app, but if you prefer PostgreSQL on Render, you'd need to migrate your schemas. Stick with MongoDB Atlas for now.

---

## 🚀 **Phase 3: Set Up GitHub Repository**

Render deploys from GitHub, so your code must be on GitHub.

### Step 3.1: Create GitHub Repository (if not already done)

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `trivia-for-maracas`
3. **Visibility**: **Public** (required for free tier) or **Private** (also works)
4. **DO NOT** initialize with README (you already have code)
5. Click **"Create repository"**

### Step 3.2: Push Your Code to GitHub

```bash
# Navigate to your project
cd /Users/shmuelvachnish-mbpr/Projects/GitHub/trivia/trivia-for-maracas

# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Add GitHub remote (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/trivia-for-maracas.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3.3: Verify Upload

Go to your GitHub repository URL and verify all files are there.

---

## 🎨 **Phase 4: Deploy to Render.com**

### Step 4.1: Create Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with:
   - **GitHub account** (RECOMMENDED - easier deployment)
   - Or Email + Password
4. If using GitHub, authorize Render to access your repositories

---

### Step 4.2: Deploy the Backend (Server)

#### A. Create Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. **Connect GitHub**: 
   - Click **"Configure account"** if needed
   - Grant access to your `trivia-for-maracas` repository
3. Select your **`trivia-for-maracas`** repository
4. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `trivia-backend` |
| **Region** | Choose closest to you (e.g., `Oregon (US West)`) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

#### B. Add Environment Variables

Before deploying, scroll to **"Environment Variables"** section and add:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render default port |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key-abc123xyz789` | Generate a random string (min 32 chars) |
| `CLIENT_URL` | *(leave empty for now)* | We'll add this after deploying frontend |

> **💡 Tip**: For `JWT_SECRET`, use a password generator or run:
> ```bash
> openssl rand -base64 32
> ```

#### C. Deploy Backend

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. **Wait 3-5 minutes** for the first deployment
4. Watch the logs - you should see "Build successful" and "Your service is live"
5. **SAVE YOUR BACKEND URL** - it will be like:
   ```
   https://trivia-backend.onrender.com
   ```

#### D. Verify Backend

Open your backend URL in a browser:
```
https://trivia-backend.onrender.com
```

You should see your API response (maybe "API is running" or a JSON response).

---

### Step 4.3: Deploy the Frontend (Client)

#### A. Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Select your **`trivia-for-maracas`** repository
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `trivia-client` |
| **Branch** | `main` |
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### B. Add Environment Variables

Add these environment variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://trivia-backend.onrender.com` (your backend URL) |

> **Note**: If your client code uses `import.meta.env.VITE_API_URL` to reference the API, this will work. Otherwise, you may need to update your code.

#### C. Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for build and deployment (2-3 minutes)
3. **SAVE YOUR FRONTEND URL** - it will be like:
   ```
   https://trivia-client.onrender.com
   ```

---

### Step 4.4: Deploy Backoffice (Admin Panel) - OPTIONAL

Repeat Step 4.3 for the backoffice:

1. **New +** → **Static Site**
2. **Name**: `trivia-backoffice`
3. **Root Directory**: `backoffice`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables**: Same as client

---

### Step 4.5: Update Backend to Allow Frontend

1. Go back to your **Backend service** (`trivia-backend`)
2. Click **"Environment"** tab
3. **ADD** or **UPDATE** `CLIENT_URL`:
   ```
   CLIENT_URL=https://trivia-client.onrender.com
   ```
4. Click **"Save Changes"**
5. Render will **automatically redeploy** the backend

---

## ✅ **Phase 5: Verify Everything Works**

### Step 5.1: Test Your App

1. Open your **frontend URL**: `https://trivia-client.onrender.com`
2. Try to:
   - ✅ Load the homepage
   - ✅ Create a new user
   - ✅ Log in
   - ✅ Play a trivia game
   - ✅ View leaderboard
   - ✅ Upload avatar
3. Check browser console for errors

### Step 5.2: Check Logs

If something doesn't work:

1. Go to Render Dashboard
2. Click on your **backend service**
3. Click **"Logs"** tab
4. Look for error messages

Common issues:
- **Database connection failed**: Check `MONGODB_URI` is correct
- **CORS errors**: Verify `CLIENT_URL` matches your frontend URL exactly
- **404 on API calls**: Check `VITE_API_URL` in frontend environment

---

## 🎁 **Phase 6: Share Your App**

### Step 6.1: Get Shareable Link

Your app is now live at:
```
https://trivia-client.onrender.com
```

Share this URL with your friends!

### Step 6.2: Custom Domain (Optional - Free!)

Want a custom domain like `mytrivia.app`?

1. **Buy a domain** (from Namecheap, Google Domains, etc.)
2. In Render, go to your **Static Site**
3. Click **"Settings"** → **"Custom Domain"**
4. Follow Render's instructions to add DNS records

---

## 📊 **Phase 7: Monitor Usage**

### Free Tier Limitations

**Render Free Tier:**
- ✅ **750 hours/month** of runtime (enough for 24/7 operation)
- ⚠️ **Sleeps after 15 minutes of inactivity** (spins up in ~30 seconds when accessed)
- ✅ **Unlimited requests**
- ✅ **100 GB bandwidth/month**

**MongoDB Atlas Free Tier:**
- ✅ **512 MB storage**
- ✅ **Shared CPU**
- ✅ **Unlimited connections**

**Perfect for sharing with friends!** But if traffic grows significantly, you may need to upgrade.

---

## 🔧 **Phase 8: Ongoing Maintenance**

### Auto-Deploy on Git Push

Render automatically redeploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update trivia questions"
git push origin main

# Render automatically deploys! 🚀
```

### Keep Your App Awake

Free tier services sleep after 15 minutes. To prevent this:

1. Use **UptimeRobot** (free): [https://uptimerobot.com](https://uptimerobot.com)
2. Create a monitor that pings your backend every 5 minutes
3. This keeps your app always responsive

### Monitor Logs

Check Render logs regularly for errors or performance issues.

---

## 🆘 **Troubleshooting**

### Backend Won't Start

**Error**: `Application failed to respond`

**Solutions**:
- Check `PORT` environment variable is `10000`
- Verify `npm start` works locally
- Check logs for detailed error messages

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`

**Solutions**:
- Verify `VITE_API_URL` matches your backend URL **exactly** (no trailing slash)
- Check `CLIENT_URL` in backend environment variables
- Ensure CORS is configured correctly in backend code

### Database Connection Failed

**Error**: `MongoServerError: Authentication failed`

**Solutions**:
- Double-check `MONGODB_URI` connection string
- Verify password has no special characters that need URL encoding
- Ensure MongoDB Atlas allows connections from `0.0.0.0/0`

### Upload/Avatar Issues

**Error**: Files not saving

**Solutions**:
- Render's free tier has **ephemeral storage** (files deleted on restart)
- For persistent uploads, use:
  - **Cloudinary** (free tier - 25 GB storage): [https://cloudinary.com](https://cloudinary.com)
  - **AWS S3** (requires credit card)

---

## 💰 **Cost Breakdown**

| Service | Cost | What You Get |
|---------|------|--------------|
| **Render** | **$0/month** | Backend + Frontend + Backoffice hosting |
| **MongoDB Atlas** | **$0/month** | Database (512 MB) |
| **Domain** (optional) | **~$12/year** | Custom domain like `mytrivia.app` |
| **TOTAL** | **$0-1/month** | Fully functional public app! |

---

## 🎉 **Success!**

Your trivia app is now:
- ✅ **Live on the internet**
- ✅ **Publicly accessible**
- ✅ **Free to host**
- ✅ **Professional URL**
- ✅ **Auto-deploys on git push**

**Share the link with your friends and enjoy!** 🚀

---

## 📚 **Additional Resources**

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

## 🆘 **Need Help?**

If you get stuck:
1. Check Render logs (most detailed error info)
2. Check MongoDB Atlas monitoring
3. Use browser DevTools console
4. Search Render's community forum
5. Ask me for help!

Good luck with your deployment! 🎊
