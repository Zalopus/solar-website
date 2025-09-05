# 🚀 Solar Website Deployment Guide

## Free Hosting Options for Testing

### Option 1: Railway (Recommended - Full Stack)
**Best for**: Complete testing with backend + database

#### Steps:
1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Your Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your solar project repository
   - Railway will auto-detect Node.js

3. **Add MongoDB Database**
   - In Railway dashboard, click "New"
   - Select "Database" → "MongoDB"
   - Copy the connection string

4. **Set Environment Variables**
   ```
   MONGODB_URI=mongodb://railway-connection-string
   JWT_SECRET=your-secret-key-here
   NODE_ENV=production
   PORT=3000
   ```

5. **Deploy**
   - Railway will automatically deploy
   - Get your live URL: `https://yourproject.railway.app`

### Option 2: Vercel (Frontend Only)
**Best for**: Quick frontend testing

#### Steps:
1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect static site
   - Deploy!

3. **Result**
   - Live URL: `https://yourproject.vercel.app`
   - Note: Backend features won't work (no server)

### Option 3: Netlify (Frontend + Forms)
**Best for**: Frontend with form handling

#### Steps:
1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy**
   - Drag & drop your `public` folder
   - Or connect GitHub repository
   - Deploy!

3. **Enable Forms**
   - Go to Site Settings → Forms
   - Enable form notifications

## Environment Variables for Production

Create these in your hosting platform:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/solartn

# Security
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production

# Server
PORT=3000

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Testing Checklist

### Before Deployment:
- [ ] Test all endpoints locally
- [ ] Check admin panel login
- [ ] Verify form submissions
- [ ] Test WhatsApp integration
- [ ] Check mobile responsiveness

### After Deployment:
- [ ] Test live website
- [ ] Test admin panel
- [ ] Submit test quote
- [ ] Check database connection
- [ ] Test all API endpoints
- [ ] Verify SSL certificate

## Free Database Options

### MongoDB Atlas (Free Tier)
- 512MB storage
- Perfect for testing
- Global clusters
- Automatic backups

### Railway MongoDB
- Included with Railway hosting
- No separate setup needed
- Automatic scaling

## Cost Breakdown

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Railway | $5 credit/month | $5+/month |
| Vercel | Unlimited static | $20+/month |
| Netlify | 100GB bandwidth | $19+/month |
| MongoDB Atlas | 512MB storage | $9+/month |

## Quick Start (Railway)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**
   - Connect GitHub repo
   - Add MongoDB database
   - Set environment variables
   - Deploy!

3. **Test Live Site**
   - Visit your Railway URL
   - Test all features
   - Share with clients for feedback

## Support

If you need help with deployment:
- Railway Docs: [docs.railway.app](https://docs.railway.app)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)
