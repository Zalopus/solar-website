# 🚀 Quick Deploy Guide - Railway (5 Minutes)

## Step 1: Push to GitHub (2 minutes)

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Solar website ready for deployment"

# Push to GitHub (create repo first on github.com)
git remote add origin https://github.com/yourusername/solar-website.git
git push -u origin main
```

## Step 2: Deploy on Railway (3 minutes)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your solar project**
6. **Railway auto-detects Node.js - click Deploy!**

## Step 3: Add Database

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "MongoDB"**
3. **Copy the connection string**

## Step 4: Set Environment Variables

In Railway dashboard → Variables tab:

```
MONGODB_URI=mongodb://railway-connection-string-here
JWT_SECRET=e2f7cc865e718eb2b898fb6a6d8897b4f8aefadc9034b3e2be2b178bfc0945025a96287c32eb6bb8e6c49ec7c6849780fc17d20b4c5542503b3bfc8a665e74db
NODE_ENV=production
PORT=3000
```

## Step 5: Test Your Live Site! 🎉

- **Your live URL**: `https://yourproject.railway.app`
- **Admin Panel**: `https://yourproject.railway.app/admin`
- **Login**: admin / admin123

## That's It! ✨

Your solar website is now live and ready for testing!

### What You Get:
- ✅ **Free hosting** (with $5 monthly credit)
- ✅ **Free database** (MongoDB)
- ✅ **SSL certificate** (automatic)
- ✅ **Custom domain** (optional)
- ✅ **Auto-deploy** (when you push to GitHub)

### Next Steps:
1. **Test all features** on your live site
2. **Share with customers** for feedback
3. **Customize content** through admin panel
4. **Add your real business info**

## Need Help?

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **MongoDB Atlas**: [cloud.mongodb.com](https://cloud.mongodb.com) (alternative database)

---

**Total Cost: $0** (Free tier covers testing needs)
**Setup Time: 5 minutes**
**Result: Professional live website** 🌞
