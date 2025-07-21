# Development Guide

This guide provides detailed information for developers who want to contribute to or extend the Clinic Management System.

## Project Architecture

### Frontend Architecture
```
├── Presentation Layer (HTML/CSS)
├── Business Logic Layer (JavaScript Modules)
├── Data Access Layer (Firebase SDK)
└── External Services (Firebase Auth/Firestore)
```

### Module Structure

#### 1. Authentication Module (`auth.js`)
- User registration and login
- Role-based access control
- Session management
- Password reset functionality

#### 2. Patient Module (`patient.js`)
- Patient registration
- Patient data management
- Search functionality
- History tracking

#### 3. Doctor Module (`doctor.js`)
- Patient queue management
- Prescription writing
- Patient history viewing
- Consultation tracking

#### 4. Receptionist Module (`receptionist.js`)
- Token management
- Patient registration interface
- Billing interface
- Dashboard statistics

#### 5. Billing Module (`billing.js`)
- Bill generation
- Service pricing
- Payment tracking
- Receipt printing

#### 6. Application Controller (`app.js`)
- Global event handling
- Navigation management
- Modal management
- Utility functions

## Code Standards

### JavaScript Style Guide

1. **Use ES6+ Features**
   ```javascript
   // Good
   const users = await db.collection('users').get();
   const userList = users.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   
   // Avoid
   var users = db.collection('users').get().then(function(snapshot) {
       // old style
   });
   ```

2. **Async/Await Pattern**
   ```javascript
   // Good
   async function loadPatients() {
       try {
           const snapshot = await db.collection('patients').get();
           return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       } catch (error) {
           console.error('Error loading patients:', error);
           throw error;
       }
   }
   ```

3. **Error Handling**
   ```javascript
   // Always include try-catch for async operations
   try {
       await db.collection('patients').add(patientData);
       authModule.showMessage('Patient added successfully', 'success');
   } catch (error) {
       console.error('Error adding patient:', error);
       authModule.showMessage('Error adding patient', 'error');
   }
   ```

4. **Function Naming**
   ```javascript
   // Use descriptive names
   async function registerNewPatient(patientData) { }
   async function generateDailyToken(patientId) { }
   async function loadPatientPrescriptionHistory(patientId) { }
   ```

### CSS Guidelines

1. **BEM Methodology**
   ```css
   /* Block */
   .patient-card { }
   
   /* Element */
   .patient-card__name { }
   .patient-card__phone { }
   
   /* Modifier */
   .patient-card--waiting { }
   .patient-card--consulted { }
   ```

2. **CSS Custom Properties**
   ```css
   :root {
       --primary-color: #667eea;
       --secondary-color: #764ba2;
       --success-color: #28a745;
       --error-color: #dc3545;
       --border-radius: 10px;
       --box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
   }
   ```

3. **Responsive Design**
   ```css
   /* Mobile-first approach */
   .container {
       padding: 1rem;
   }
   
   @media (min-width: 768px) {
       .container {
           padding: 2rem;
       }
   }
   ```

### HTML Best Practices

1. **Semantic HTML**
   ```html
   <main class="dashboard">
       <aside class="sidebar">
           <nav class="sidebar-nav">
               <a href="#" class="nav-item">Patients</a>
           </nav>
       </aside>
       <section class="main-content">
           <article class="patient-list">
               <!-- content -->
           </article>
       </section>
   </main>
   ```

2. **Accessibility**
   ```html
   <button aria-label="Close modal" class="close-btn">×</button>
   <input type="text" aria-describedby="name-help" />
   <div id="name-help" class="help-text">Enter patient's full name</div>
   ```

## Adding New Features

### 1. Create New Module
```javascript
// js/new-feature.js
class NewFeatureModule {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add event listeners
    }
    
    async saveData(data) {
        try {
            await db.collection('new-collection').add(data);
            authModule.showMessage('Success', 'success');
        } catch (error) {
            console.error('Error:', error);
            authModule.showMessage('Error occurred', 'error');
        }
    }
}

const newFeatureModule = new NewFeatureModule();
window.newFeatureModule = newFeatureModule;
```

### 2. Add to HTML
```html
<!-- Add new section -->
<section id="newFeature" class="section">
    <div class="feature-content">
        <!-- Feature content -->
    </div>
</section>

<!-- Add script reference -->
<script src="js/new-feature.js"></script>
```

### 3. Update Navigation
```javascript
// In app.js, add new navigation function
showNewFeature() {
    this.showSection('newFeature');
}
```

## Database Operations

### Create (Add Document)
```javascript
const docRef = await db.collection('patients').add({
    name: 'John Doe',
    age: 30,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### Read (Get Documents)
```javascript
// Get all documents
const snapshot = await db.collection('patients').get();
const patients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Get specific document
const doc = await db.collection('patients').doc(patientId).get();
const patient = { id: doc.id, ...doc.data() };

// Query with filters
const snapshot = await db.collection('patients')
    .where('status', '==', 'waiting')
    .orderBy('registrationDate', 'desc')
    .limit(10)
    .get();
```

### Update (Modify Document)
```javascript
await db.collection('patients').doc(patientId).update({
    status: 'consulted',
    consultedAt: firebase.firestore.FieldValue.serverTimestamp()
});
```

### Delete (Remove Document)
```javascript
await db.collection('patients').doc(patientId).delete();
```

### Real-time Listeners
```javascript
const unsubscribe = db.collection('tokens')
    .where('date', '==', today)
    .onSnapshot((snapshot) => {
        const tokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.updateTokenDisplay(tokens);
    });

// Don't forget to unsubscribe when component unmounts
// unsubscribe();
```

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] User registration with different roles
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Role-based access control

#### Patient Management
- [ ] Patient registration form validation
- [ ] Token generation after registration
- [ ] Patient search functionality
- [ ] Patient status updates
- [ ] Patient history viewing

#### Doctor Portal
- [ ] Patient queue display
- [ ] Prescription form submission
- [ ] Patient history search
- [ ] Consultation completion

#### Receptionist Portal
- [ ] Dashboard statistics
- [ ] Token management
- [ ] Billing form
- [ ] Bill generation and printing

#### Responsive Design
- [ ] Mobile device compatibility
- [ ] Tablet compatibility
- [ ] Desktop compatibility
- [ ] Navigation on different screen sizes

### Unit Testing (Future Implementation)
```javascript
// Example test structure
describe('PatientModule', () => {
    test('should register patient successfully', async () => {
        const patientData = {
            name: 'Test Patient',
            age: 25,
            gender: 'male',
            phone: '1234567890'
        };
        
        const result = await patientModule.registerPatient(patientData);
        expect(result).toBeDefined();
        expect(result.id).toBeTruthy();
    });
});
```

## Performance Optimization

### 1. Database Optimization
- Use compound indexes for complex queries
- Limit query results with `.limit()`
- Use pagination for large datasets
- Cache frequently accessed data

### 2. Frontend Optimization
- Lazy load non-critical modules
- Minimize DOM manipulations
- Use event delegation
- Optimize images and assets

### 3. Firebase Optimization
```javascript
// Use offline persistence
firebase.firestore().enablePersistence();

// Optimize queries
const query = db.collection('patients')
    .where('status', '==', 'waiting')
    .orderBy('registrationDate')
    .limit(20); // Limit results
```

## Security Considerations

### Input Validation
```javascript
function validatePatientData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (!data.phone || !/^\d{10}$/.test(data.phone)) {
        errors.push('Phone must be 10 digits');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}
```

### Data Sanitization
```javascript
function sanitizeInput(input) {
    return input.trim().replace(/[<>\"']/g, '');
}
```

### Firebase Security Rules
```javascript
// Allow only authenticated users
allow read, write: if request.auth != null;

// Role-based access
allow read, write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['doctor', 'receptionist'];
```

## Deployment

### Development Environment
```bash
# Local server
python -m http.server 8000
# or
npx http-server
```

### Production Deployment

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Environment Variables
```javascript
// config.js for production
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    // ...
};
```

## Contributing Guidelines

### Before Contributing
1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Write tests (when applicable)
5. Update documentation

### Pull Request Process
1. Update README.md if needed
2. Follow commit message conventions
3. Ensure all tests pass
4. Get code review approval
5. Merge to main branch

### Commit Message Format
```
type(scope): subject

body

footer
```

Example:
```
feat(billing): add PDF generation for bills

- Implement PDF export functionality
- Add download button to bill modal
- Include clinic branding in PDF

Closes #123
```

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript Style Guide](https://github.com/airbnb/javascript)
- [CSS Guidelines](https://cssguidelin.es/)

## Support

For development questions:
1. Check existing documentation
2. Search through GitHub issues
3. Create a new issue with detailed description
4. Include code samples and error messages
