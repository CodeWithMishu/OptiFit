# OptiFit AI - Setup Instructions

## 🔧 Manual Configuration Required

You need to set up **MongoDB Atlas** (free) to get your database connection string.

---

## 📦 MongoDB Atlas Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a **FREE** account
3. Verify your email

### Step 2: Create a Cluster

1. After login, click **"Build a Database"**
2. Select **M0 FREE** tier (0.5GB storage, free forever)
3. Choose a cloud provider:
   - AWS, Google Cloud, or Azure (any works)
   - Select a region close to you or your users
4. Cluster Name: Keep default or name it `OptiFit-Cluster`
5. Click **"Create"** (takes 3-5 minutes to provision)

### Step 3: Create Database User

1. You'll see a **"Security Quickstart"** screen
2. **Authentication Method**: Username and Password
3. Create credentials:
   - Username: `optifit_user` (or any name you prefer)
   - Password: Click **"Autogenerate Secure Password"**
   - **⚠️ COPY THIS PASSWORD** - you'll need it in Step 5
4. Click **"Create User"**

### Step 4: Whitelist IP Address

1. Scroll down to **"Where would you like to connect from?"**
2. Click **"Add My Current IP Address"**
3. For development, you can also click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is okay for dev/testing with proper authentication
   - For production, restrict to specific IPs
4. Click **"Finish and Close"**

### Step 5: Get Connection String

1. Click **"Go to Databases"** (or navigate to Databases from left menu)
2. Find your cluster and click **"Connect"**
3. Select **"Connect your application"**
4. Driver: **Node.js**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://optifit_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with the password you copied in Step 3
7. Add the database name `optifit` before the `?`:
   ```
   mongodb+srv://optifit_user:YourPasswordHere@cluster0.xxxxx.mongodb.net/optifit?retryWrites=true&w=majority
   ```

### Step 6: Update Backend .env File

1. Open `/backend/.env`
2. Replace the `MONGODB_URI` line with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://optifit_user:YourPasswordHere@cluster0.xxxxx.mongodb.net/optifit?retryWrites=true&w=majority
   ```
3. Save the file

✅ **MongoDB setup complete!**

---

## 🚀 Running Locally

### Start Backend (Terminal 1)

```bash
cd /home/codewithmishu/OptiFit/backend
npm run dev
```

You should see:
```
MongoDB connected
Server running on port 5000 in development mode
```

### Start Frontend (Terminal 2)

```bash
cd /home/codewithmishu/OptiFit/frontend
npm run dev
```

You should see:
```
✓ Ready on http://localhost:3000
```

### Access Application

Open browser: **http://localhost:3000**

---

## ✅ Verify Everything Works

1. Fill out the form with test data
2. Click "Next: Scan Face"
3. Allow camera access
4. Click "Start Camera"
5. Click "Capture & Detect"
6. View results showing face shape and frame recommendations
7. Check your MongoDB Atlas dashboard - you should see a new document in the `users` collection

---

## 🌐 Production Deployment

### Deploy Backend to Render

1. **Create Render Account**: [https://render.com](https://render.com)
2. **New Web Service** → Connect your Git repository
3. **Settings**:
   - Name: `optifit-backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free
4. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-atlas-connection-string>
   CORS_ORIGIN=https://your-frontend-app.vercel.app
   ```
5. **Deploy** (takes 5-10 minutes)
6. Copy your backend URL: `https://optifit-backend.onrender.com`

### Deploy Frontend to Vercel

1. **Create Vercel Account**: [https://vercel.com](https://vercel.com)
2. **New Project** → Import your Git repository
3. **Settings**:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL=https://optifit-backend.onrender.com/api
   ```
5. **Deploy**
6. Your app is live at: `https://your-app.vercel.app`

### Update Backend CORS

After deploying frontend, update your Render environment variable:
```
CORS_ORIGIN=https://your-app.vercel.app
```

---

## 🔒 Security Checklist for Production

- [ ] Change MongoDB Atlas IP whitelist from 0.0.0.0/0 to specific IPs
- [ ] Use strong database passwords (already done with autogenerate)
- [ ] Set `NODE_ENV=production` on backend
- [ ] Set correct `CORS_ORIGIN` to your frontend URL
- [ ] Never commit `.env` files to git (already in .gitignore)
- [ ] Enable MongoDB Atlas database backups
- [ ] Monitor rate limiting on API routes

---

## 🎯 Quick Reference

**Local URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

**API Endpoints:**
- `POST /api/users` - Create user record
- `GET /api/users/:id` - Get user by ID
- `GET /api/users` - Get all users (list)

**File Locations:**
- Backend env: `/home/codewithmishu/OptiFit/backend/.env`
- Frontend env: `/home/codewithmishu/OptiFit/frontend/.env.local`

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
- Check your connection string has the correct password
- Verify IP whitelist includes your IP (or 0.0.0.0/0)
- Ensure cluster is active in Atlas dashboard

### "CORS error"
- Check `CORS_ORIGIN` in backend .env matches your frontend URL
- Restart backend after changing .env

### "Camera not working"
- Must use HTTPS in production (Vercel provides this)
- Check browser permissions for camera access
- Test in Chrome/Edge (best MediaPipe support)

### "Face detection not working"
- Ensure good lighting
- Face should be clearly visible and front-facing
- MediaPipe loads from CDN - check internet connection

---

## 📧 Need Help?

If you encounter issues:
1. Check terminal logs for error messages
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas cluster is running (not paused)

---

**🎉 That's it! Your OptiFit AI application is ready to use.**
