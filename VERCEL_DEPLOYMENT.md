# Deploying Clinic Management System to Vercel

## Overview
This guide will help you deploy your Clinic Management System to Vercel, a popular platform for hosting static websites and frontend applications.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Node.js**: Install Node.js (version 14 or higher)
4. **Vercel CLI** (optional): For command-line deployment

## Method 1: Deploy via Vercel Web Interface (Recommended)

### Step 1: Connect GitHub Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `https://github.com/NaomiYadav/Clinic-Management-System`
4. Click "Import"

### Step 2: Configure Project Settings
1. **Project Name**: `clinic-management-system` (or your preferred name)
2. **Framework Preset**: Select "Other" (static site)
3. **Root Directory**: `./` (leave as default)
4. **Build and Output Settings**:
   - Build Command: Leave empty (static site)
   - Output Directory: Leave empty (serves from root)
   - Install Command: `npm install` (optional)

### Step 3: Environment Variables (If Needed)
If you have any environment variables, add them in the "Environment Variables" section:
- No environment variables needed for this project as Firebase config is in the code

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Your site will be available at: `https://your-project-name.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from Project Directory
```bash
# Navigate to your project directory
cd "c:\Users\acer\Downloads\unified mentor\Clinic-Management-System"

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

## Method 3: Deploy via Git Integration

### Step 1: Push to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Add remote origin
git remote add origin https://github.com/NaomiYadav/Clinic-Management-System.git

# Push to GitHub
git push -u origin main
```

### Step 2: Connect Vercel to GitHub
1. In Vercel dashboard, click "Add New Project"
2. Select your GitHub repository
3. Click "Import"
4. Configure settings and deploy

## Post-Deployment Configuration

### 1. Update Firebase Configuration (If Needed)
Make sure your Firebase project allows your Vercel domain:
1. Go to Firebase Console
2. Navigate to Authentication → Settings → Authorized Domains
3. Add your Vercel domain: `your-project-name.vercel.app`

### 2. Test All Features
After deployment, test:
- ✅ User registration and login
- ✅ Patient registration
- ✅ Doctor and receptionist dashboards
- ✅ Token generation
- ✅ Billing system
- ✅ All Firebase operations

### 3. Custom Domain (Optional)
To use a custom domain:
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS settings as instructed

## Deployment Commands

After initial setup, you can use these npm scripts:

```bash
# Deploy to production
npm run deploy

# Deploy preview version
npm run deploy:preview
```

## Automatic Deployments

Once connected to GitHub:
- **Production**: Deploys automatically on push to `main` branch
- **Preview**: Deploys automatically on push to other branches
- **Pull Requests**: Creates preview deployments for each PR

## Troubleshooting

### Common Issues:

1. **Firebase Connection Issues**
   - Ensure Firebase config is correct
   - Check authorized domains in Firebase Console

2. **File Not Found Errors**
   - Verify all file paths are relative
   - Check case sensitivity in file names

3. **Build Failures**
   - Check package.json scripts
   - Ensure all dependencies are listed

### Getting Help:
- Check Vercel deployment logs
- Review browser console for errors
- Verify Firebase setup and permissions

## Expected Deployment URL
Your app will be available at: `https://clinic-management-system-[hash].vercel.app`

## Performance Optimization
Vercel automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Compression
- ✅ Image optimization
- ✅ Edge functions support

Your Clinic Management System is now ready for production use on Vercel!
