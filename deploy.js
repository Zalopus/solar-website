#!/usr/bin/env node

/**
 * Simple deployment helper script
 * This script helps prepare your project for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Solar Website Deployment Helper\n');

// Check if all required files exist
const requiredFiles = [
    'package.json',
    'server.js',
    'public/index.html',
    'public/styles.css',
    'admin/index.html',
    'admin/admin.css',
    'admin/admin.js'
];

console.log('📋 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing. Please check your project structure.');
    process.exit(1);
}

// Check package.json scripts
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.scripts && packageJson.scripts.start) {
    console.log('✅ Start script found');
} else {
    console.log('❌ Start script missing in package.json');
}

// Check for .env file
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env')) {
    console.log('✅ .env file found');
} else {
    console.log('⚠️  .env file not found - you\'ll need to set environment variables in your hosting platform');
}

// Create deployment checklist
const checklist = `
🎯 DEPLOYMENT CHECKLIST:

1. 📁 Push to GitHub:
   git add .
   git commit -m "Ready for deployment"
   git push origin main

2. 🌐 Choose Hosting Platform:
   - Railway (Full Stack): railway.app
   - Vercel (Frontend): vercel.com
   - Netlify (Frontend): netlify.com

3. 🔧 Set Environment Variables:
   - MONGODB_URI (get from MongoDB Atlas or Railway)
   - JWT_SECRET (generate a secure random string)
   - NODE_ENV=production
   - PORT=3000

4. 🗄️ Database Setup:
   - MongoDB Atlas (free tier): cloud.mongodb.com
   - Or use Railway's included MongoDB

5. ✅ Test After Deployment:
   - Visit your live URL
   - Test admin panel login
   - Submit a test quote
   - Check all features

6. 📱 Share & Get Feedback:
   - Share with potential customers
   - Test on mobile devices
   - Get feedback before final launch

🚀 Your solar website is ready for deployment!
`;

console.log(checklist);

// Generate a random JWT secret for production
const crypto = require('crypto');
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log(`\n🔑 Generated JWT Secret for Production:`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`\n💡 Copy this to your hosting platform's environment variables`);

console.log('\n✨ Deployment preparation complete!');
