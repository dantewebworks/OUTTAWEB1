# Deploy to Render - Step by Step Guide

## Prerequisites
- GitHub account
- Render account (free at render.com)

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it: `outta-web-app`
3. Make it public
4. Don't initialize with README (we already have files)

## Step 2: Push to GitHub

Run these commands in your terminal:

```bash
# Add GitHub as a remote
git remote add origin https://github.com/YOUR_USERNAME/outta-web-app.git

# Push to GitHub
git add .
git commit -m "Initial commit for Render deployment"
git push -u origin master
```

## Step 3: Deploy to Render

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub account
4. Select the `outta-web-app` repository
5. Configure the service:
   - **Name**: `outta-web-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. Click "Create Web Service"

## Step 4: Your App is Live!

Render will automatically deploy your app and give you a URL like:
`https://outta-web-app.onrender.com`

## Files Included for Render Deployment

- ✅ `package.json` - Node.js dependencies and scripts
- ✅ `server.js` - Express server
- ✅ `render.yaml` - Render configuration
- ✅ `outta_web.html` - Main application file

## Environment Variables (if needed)

If you need to add environment variables later:
1. Go to your Render dashboard
2. Select your service
3. Go to "Environment" tab
4. Add any required environment variables

## Auto-Deploy

Render will automatically redeploy when you push changes to GitHub!
