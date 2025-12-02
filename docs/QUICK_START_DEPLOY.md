# 🚀 Quick Start: Deploy Your Trivia App to Render.com (FREE)

**Total Time: ~30 minutes**  
**Cost: $0/month**

## 📋 What You'll Need

- ✅ GitHub account
- ✅ MongoDB Atlas account (free)
- ✅ Render.com account (free)
- ✅ Your trivia app code (ready to deploy!)

---

## ⚡ Quick Steps Overview

1. **Set up MongoDB database** (5 min)
2. **Push code to GitHub** (5 min)
3. **Deploy backend to Render** (10 min)
4. **Deploy frontend to Render** (5 min)
5. **Configure and test** (5 min)

---

## 🎯 Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create Account
- Go to [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
- Sign up (free, no credit card needed)

### 1.2 Create Free Database
- Click **"Build a Database"**
- Select **M0 FREE** tier (512 MB)
- Choose region closest to you
- Click **"Create Deployment"**

### 1.3 Create Database User
- Username: `trivia-admin`
- Click **"Autogenerate Password"** → **SAVE IT!**
- Click **"Create Database User"**

### 1.4 Allow Network Access
- Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
- Click **"Finish and Close"**

### 1.5 Get Connection String
- Click **"Connect"** → **"Connect your application"**
- Copy the connection string (looks like `mongodb+srv://...`)
- Replace `<password>` with your saved password
- Add database name: `trivia-production` before the `?`
- **Final format:**
  ```
  mongodb+srv://trivia-admin:YOUR_PASSWORD@cluster.xxxxx.mongodb.net/trivia-production?retryWrites=true&w=majority
  ```
- **SAVE THIS!** You'll need it for Render

---

## 🐙 Step 2: Push to GitHub

```bash
cd /Users/shmuelvachnish-mbpr/Projects/GitHub/trivia/trivia-for-maracas

# Initialize git if not already done
git status

# If not initialized:
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub (https://github.com/new)
# Then connect it:
git remote add origin https://github.com/YOUR-USERNAME/trivia-for-maracas.git
git branch -M main
git push -u origin main
```

---

## 🎨 Step 3: Deploy Backend to Render

### 3.1 Create Account
- Go to [render.com](https://render.com)
- Click **"Get Started"** and sign up with **GitHub**

### 3.2 Create Web Service
- Click **"New +"** → **"Web Service"**
- Select your `trivia-for-maracas` repository
- Fill in:
  - **Name**: `trivia-backend`
  - **Root Directory**: `server`
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Instance Type**: **Free**

### 3.3 Add Environment Variables
Click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | *(your MongoDB connection string)* |
| `JWT_SECRET` | *(generate random 32+ chars)* |

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 3.4 Deploy
- Click **"Create Web Service"**
- Wait 3-5 minutes for deployment
- **COPY YOUR BACKEND URL**: `https://trivia-backend.onrender.com`

---

## 🌐 Step 4: Deploy Frontend to Render

### 4.1 Create Static Site
- Click **"New +"** → **"Static Site"**
- Select your `trivia-for-maracas` repository
- Fill in:
  - **Name**: `trivia-client`
  - **Root Directory**: `client`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `dist`

### 4.2 Add Environment Variable
| Key | Value |
|-----|-------|
| `VITE_API_URL` | *(your backend URL, e.g., `https://trivia-backend.onrender.com`)* |

### 4.3 Deploy
- Click **"Create Static Site"**
- Wait 2-3 minutes
- **COPY YOUR FRONTEND URL**: `https://trivia-client.onrender.com`

---

## 🔗 Step 5: Connect Frontend and Backend

### 5.1 Update Backend CORS
- Go to your **backend service** in Render
- Click **"Environment"** tab
- **Add** new variable:
  - **Key**: `CLIENT_URL`
  - **Value**: *(your frontend URL, e.g., `https://trivia-client.onrender.com`)*
- Click **"Save Changes"**
- Backend will auto-redeploy

---

## ✅ Step 6: Test Your App

1. Open your frontend URL: `https://trivia-client.onrender.com`
2. Try:
   - Creating a new user
   - Playing trivia
   - Viewing leaderboard
3. **If errors occur:**
   - Check Render logs (Backend → Logs tab)
   - Check browser console (F12)
   - Verify all environment variables are correct

---

## 🎉 Step 7: Share with Friends!

**Your app is now live at:**
```
https://trivia-client.onrender.com
```

Share this URL with your friends and enjoy! 🚀

---

## ⚠️ Important Notes

### Free Tier Limitations
- ✅ **24/7 hosting** (750 hours/month)
- ⚠️ **Sleeps after 15 min of inactivity** (wakes in ~30 sec)
- ✅ **Unlimited requests**
- ✅ **100 GB bandwidth/month**

### Keep App Awake (Optional)
Use [UptimeRobot](https://uptimerobot.com) (free) to ping your backend every 5 minutes.

### Auto-Deploy
Every time you push to GitHub, Render automatically redeploys! 🎊

```bash
git add .
git commit -m "Update questions"
git push origin main
# Render auto-deploys!
```

---

## 🆘 Troubleshooting

### Backend Won't Start
- ✅ Check `PORT` is `10000`
- ✅ Check `MONGODB_URI` is correct
- ✅ Check Render logs for errors

### Frontend Can't Connect
- ✅ Verify `VITE_API_URL` matches backend URL exactly
- ✅ Ensure `CLIENT_URL` is set in backend
- ✅ Check browser console for CORS errors

### Database Connection Failed
- ✅ Double-check MongoDB connection string
- ✅ Verify password has no special characters
- ✅ Ensure MongoDB allows `0.0.0.0/0` connections

---

## 📚 Full Documentation

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed explanations and advanced topics.

---

## 💰 Total Cost: **$0/month**

Enjoy your free, publicly accessible trivia app! 🎊
