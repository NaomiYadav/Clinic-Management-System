# Firebase Setup Guide

This guide will help you set up Firebase for the Clinic Management System.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "clinic-management-system"
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

## Step 3: Set up Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Choose "Test mode" for development
4. Select your preferred location
5. Click "Done"

## Step 4: Configure Security Rules

Replace the default Firestore rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Authenticated users can access patients, tokens, prescriptions, bills
    match /patients/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /tokens/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /prescriptions/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /bills/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 5: Get Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (</>) 
4. Enter app nickname: "clinic-management-web"
5. Click "Register app"
6. Copy the configuration object

## Step 6: Update config.js

Replace the configuration in `js/config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

## Step 7: Test the Setup

1. Open your application
2. Try registering a new user
3. Login with the created user
4. Test basic functionality

## Database Collections

The application will automatically create these collections:

### users
```json
{
  "name": "string",
  "email": "string", 
  "role": "doctor|receptionist",
  "license": "string (doctors only)",
  "createdAt": "timestamp"
}
```

### patients
```json
{
  "name": "string",
  "age": "number",
  "gender": "string",
  "phone": "string",
  "address": "string",
  "emergencyContact": "string",
  "visitType": "string",
  "status": "waiting|consulted|billed",
  "registrationDate": "timestamp"
}
```

### tokens
```json
{
  "number": "number",
  "patientId": "string",
  "patientName": "string",
  "patientPhone": "string",
  "visitType": "string",
  "date": "string (YYYY-MM-DD)",
  "status": "waiting|completed",
  "time": "timestamp"
}
```

### prescriptions
```json
{
  "patientId": "string",
  "doctorId": "string",
  "date": "string",
  "diagnosis": "string",
  "medications": "string",
  "instructions": "string",
  "followupDate": "string",
  "createdAt": "timestamp"
}
```

### bills
```json
{
  "billNumber": "string",
  "patientId": "string",
  "patientName": "string",
  "consultationFee": "number",
  "services": "array",
  "totalAmount": "number",
  "status": "paid|unpaid",
  "createdAt": "timestamp"
}
```

## Troubleshooting

### Common Issues:

1. **Permission Denied**: Check Firestore security rules
2. **Authentication Failed**: Verify email/password configuration
3. **Data Not Saving**: Check browser console for errors

### Debug Mode:

Add this to console for debugging:
```javascript
firebase.firestore().enableNetwork();
```

## Security Best Practices

1. Never commit Firebase config with real API keys to public repos
2. Use environment variables for production
3. Implement proper security rules
4. Enable App Check for production apps
5. Regular security audits

## Production Deployment

For production:
1. Change Firestore rules to production mode
2. Enable App Check
3. Use environment variables for config
4. Set up monitoring and alerts
5. Configure backup and recovery

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Review browser developer tools
3. Consult Firebase documentation
4. Create an issue on GitHub
