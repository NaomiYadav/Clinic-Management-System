# Deployment Guide

This guide covers various deployment options for the Clinic Management System.

## Prerequisites

- Completed Firebase setup (see FIREBASE_SETUP.md)
- Tested application locally
- Production Firebase configuration

## Deployment Options

### 1. Firebase Hosting (Recommended)

Firebase Hosting provides fast, secure hosting for your web app.

#### Setup Firebase Hosting

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting in your project
firebase init hosting
```

During initialization:
- Select your Firebase project
- Choose `public directory`: Enter `.` (current directory)
- Configure as single-page app: `No`
- Set up automatic builds with GitHub: `No` (optional)

#### Deploy to Firebase

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy with custom message
firebase deploy --only hosting -m "Initial deployment"
```

Your app will be available at: `https://your-project-id.web.app`

#### Custom Domain (Optional)

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS records as instructed

### 2. Netlify

Netlify offers continuous deployment from Git repositories.

#### Manual Deploy

1. Build your project (if needed): `npm run build`
2. Go to [Netlify](https://www.netlify.com/)
3. Drag and drop your project folder
4. Your site will be deployed automatically

#### Git-based Deploy

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository to Netlify
3. Set build settings:
   - Build command: `npm run build` (if applicable)
   - Publish directory: `.`
4. Deploy automatically on each push

#### Environment Variables

In Netlify dashboard:
1. Go to Site settings > Environment variables
2. Add your Firebase configuration variables

### 3. Vercel

Vercel provides seamless deployment for frontend applications.

#### Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Deploy from GitHub

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure build settings
4. Deploy automatically

### 4. GitHub Pages

GitHub Pages offers free hosting for static websites.

#### Setup GitHub Pages

1. Create `gh-pages` branch
2. Copy all files to `gh-pages` branch
3. Enable GitHub Pages in repository settings
4. Select `gh-pages` branch as source

#### Automated Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### 5. Traditional Web Hosting

For shared hosting or VPS deployment.

#### Upload Files

1. Compress project files (excluding node_modules)
2. Upload to web server via FTP/cPanel
3. Extract files in public_html directory
4. Configure Firebase settings

#### Server Configuration

For Apache (`.htaccess`):
```apache
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

For Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    root /path/to/your/project;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Environment Configuration

### Development vs Production

Create different Firebase projects for different environments:

#### Development Config (`js/config.dev.js`)
```javascript
const firebaseConfig = {
    apiKey: "dev-api-key",
    authDomain: "clinic-dev.firebaseapp.com",
    projectId: "clinic-dev",
    // ...
};
```

#### Production Config (`js/config.prod.js`)
```javascript
const firebaseConfig = {
    apiKey: "prod-api-key",
    authDomain: "clinic-prod.firebaseapp.com", 
    projectId: "clinic-prod",
    // ...
};
```

### Build Script

Create environment-specific builds:

```bash
# Development build
npm run build:dev

# Production build  
npm run build:prod
```

Update `package.json`:
```json
{
  "scripts": {
    "build:dev": "cp js/config.dev.js js/config.js",
    "build:prod": "cp js/config.prod.js js/config.js"
  }
}
```

## Performance Optimization

### Before Deployment

1. **Minify CSS/JS** (optional for this project)
2. **Optimize images** - compress PNG/JPG files
3. **Enable Firebase persistence**:
   ```javascript
   firebase.firestore().enablePersistence();
   ```
4. **Add service worker** for offline functionality
5. **Implement lazy loading** for non-critical components

### CDN Configuration

Use Firebase CDN or configure external CDN:

```html
<!-- Use CDN for Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
```

## Security Checklist

### Pre-deployment Security

- [ ] Update Firestore security rules for production
- [ ] Remove console.log statements
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up Firebase App Check
- [ ] Review user permissions
- [ ] Test authentication flows

### Production Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Restrict access to authenticated users only
    match /{document=**} {
      allow read, write: if request.auth != null
        && request.auth.token.email_verified == true;
    }
    
    // More restrictive rules for sensitive collections
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}
```

## Monitoring and Analytics

### Firebase Analytics

Add to your HTML:
```html
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics-compat.js"></script>
<script>
  firebase.analytics();
</script>
```

### Error Monitoring

Consider adding error tracking:
- Sentry
- LogRocket  
- Firebase Crashlytics

### Performance Monitoring

```javascript
// Add to your app
import { getPerformance } from 'firebase/performance';
const perf = getPerformance(app);
```

## Domain and SSL

### Custom Domain Setup

1. **Purchase domain** from registrar
2. **Configure DNS** to point to hosting provider
3. **Enable SSL certificate** (usually automatic)
4. **Update Firebase configuration** if needed

### SSL Certificate

Most hosting providers offer free SSL:
- Firebase Hosting: Automatic
- Netlify: Automatic  
- Vercel: Automatic
- Let's Encrypt: For VPS/dedicated servers

## Backup and Recovery

### Database Backup

Set up automated Firestore exports:

```bash
# Manual export
gcloud firestore export gs://your-bucket/backup-folder

# Scheduled exports via Cloud Functions
```

### Code Backup

- Maintain Git repository
- Regular commits to main branch
- Use branching strategy (main, develop, feature branches)
- Tag releases for version control

## Post-Deployment

### Testing in Production

1. **Smoke tests** - basic functionality
2. **User acceptance testing** - complete workflows
3. **Performance testing** - load times, responsiveness
4. **Security testing** - authentication, authorization
5. **Cross-browser testing** - different browsers/devices

### Monitoring

1. **Set up alerts** for errors and performance
2. **Monitor user activity** via analytics
3. **Track key metrics** (registration, consultations, billing)
4. **Regular security audits**

### Maintenance

1. **Regular updates** - dependencies, Firebase SDK
2. **Backup schedules** - automated database backups
3. **Performance optimization** - based on real usage data
4. **User feedback integration** - feature requests, bug reports

## Troubleshooting

### Common Deployment Issues

1. **Firebase configuration errors**
   - Verify API keys and project IDs
   - Check Firebase project settings

2. **CORS errors**
   - Configure allowed origins in Firebase
   - Check authentication domains

3. **SSL certificate issues**
   - Verify domain ownership
   - Check DNS propagation

4. **Performance issues**
   - Optimize Firestore queries
   - Implement caching strategies

5. **Authentication problems**
   - Verify email verification settings
   - Check authorized domains

### Support Resources

- Firebase Documentation
- Stack Overflow
- Firebase Community Slack
- GitHub Issues for this project
