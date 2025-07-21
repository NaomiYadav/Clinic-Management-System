# API Documentation

This document outlines the Firebase Firestore database structure and operations used in the Clinic Management System.

## Database Collections

### 1. Users Collection (`users`)

Stores user authentication and profile information.

#### Schema
```javascript
{
  id: string,                    // Auto-generated document ID
  name: string,                  // User's full name
  email: string,                 // User's email address
  role: string,                  // "doctor" | "receptionist"
  license: string | null,        // License number (doctors only)
  createdAt: Timestamp,          // Account creation date
  lastLogin: Timestamp | null    // Last login timestamp
}
```

#### Operations
- **Create**: User registration
- **Read**: User profile, role verification
- **Update**: Profile updates, last login
- **Delete**: Account deletion (admin only)

### 2. Patients Collection (`patients`)

Stores patient information and medical records.

#### Schema
```javascript
{
  id: string,                    // Auto-generated document ID
  name: string,                  // Patient's full name
  age: number,                   // Patient's age
  gender: string,                // "male" | "female" | "other"
  phone: string,                 // Contact phone number
  address: string,               // Home address
  emergencyContact: string,      // Emergency contact number
  visitType: string,             // "consultation" | "followup" | "emergency"
  status: string,                // "waiting" | "consulted" | "billed"
  registrationDate: Timestamp,   // Initial registration
  consultedAt: Timestamp | null, // Last consultation time
  billedAt: Timestamp | null,    // Last billing time
  lastVisit: string | null,      // Last visit date (YYYY-MM-DD)
  lastBillId: string | null      // Reference to last bill
}
```

#### Operations
- **Create**: Patient registration
- **Read**: Patient lookup, history retrieval
- **Update**: Status changes, consultation completion
- **Delete**: Patient record removal (rare)

### 3. Tokens Collection (`tokens`)

Manages daily patient queue tokens.

#### Schema
```javascript
{
  id: string,                    // Auto-generated document ID
  number: number,                // Token number (1, 2, 3, ...)
  patientId: string,             // Reference to patients collection
  patientName: string,           // Patient name (for quick access)
  patientPhone: string,          // Patient phone (for quick access)
  visitType: string,             // Type of visit
  date: string,                  // Date in YYYY-MM-DD format
  status: string,                // "waiting" | "completed"
  time: Timestamp,               // Token generation time
  completedAt: Timestamp | null, // Completion timestamp
  createdBy: string              // User ID who created token
}
```

#### Operations
- **Create**: Token generation during registration
- **Read**: Daily token list, queue status
- **Update**: Token completion status
- **Delete**: Daily cleanup (optional)

### 4. Prescriptions Collection (`prescriptions`)

Stores medical prescriptions and treatment records.

#### Schema
```javascript
{
  id: string,                    // Auto-generated document ID
  patientId: string,             // Reference to patients collection
  doctorId: string,              // Reference to users collection (doctor)
  date: string,                  // Prescription date (YYYY-MM-DD)
  diagnosis: string,             // Medical diagnosis
  medications: string,           // Prescribed medications
  instructions: string,          // Treatment instructions
  followupDate: string | null,   // Follow-up date (YYYY-MM-DD)
  createdAt: Timestamp           // Creation timestamp
}
```

#### Operations
- **Create**: New prescription entry
- **Read**: Patient prescription history
- **Update**: Prescription modifications (rare)
- **Delete**: Prescription removal (rare)

### 5. Bills Collection (`bills`)

Manages billing and payment records.

#### Schema
```javascript
{
  id: string,                    // Auto-generated document ID
  billNumber: string,            // Unique bill identifier
  patientId: string,             // Reference to patients collection
  patientName: string,           // Patient name (for quick access)
  patientPhone: string,          // Patient phone (for quick access)
  consultationFee: number,       // Base consultation fee
  services: Array<{              // Additional services
    name: string,                // Service name
    price: number                // Service price
  }>,
  servicesTotal: number,         // Total of additional services
  totalAmount: number,           // Grand total
  status: string,                // "paid" | "unpaid"
  createdAt: Timestamp,          // Bill generation time
  createdBy: string              // User ID who created bill
}
```

#### Operations
- **Create**: Bill generation
- **Read**: Bill history, patient billing
- **Update**: Payment status updates
- **Delete**: Bill cancellation (admin only)

## Common Query Patterns

### 1. Authentication Queries

#### Get User Role
```javascript
const userDoc = await db.collection('users').doc(userId).get();
const userRole = userDoc.data().role;
```

#### Check Doctor License
```javascript
const doctorQuery = await db.collection('users')
  .where('role', '==', 'doctor')
  .where('license', '==', licenseNumber)
  .get();
```

### 2. Patient Management Queries

#### Get Waiting Patients
```javascript
const waitingPatients = await db.collection('patients')
  .where('status', '==', 'waiting')
  .orderBy('registrationDate')
  .get();
```

#### Search Patients by Name
```javascript
const patientsByName = await db.collection('patients')
  .orderBy('name')
  .startAt(searchTerm)
  .endAt(searchTerm + '\uf8ff')
  .get();
```

#### Search Patients by Phone
```javascript
const patientsByPhone = await db.collection('patients')
  .where('phone', '>=', phoneNumber)
  .where('phone', '<=', phoneNumber + '\uf8ff')
  .get();
```

### 3. Token Management Queries

#### Get Today's Tokens
```javascript
const today = new Date().toISOString().split('T')[0];
const todaysTokens = await db.collection('tokens')
  .where('date', '==', today)
  .orderBy('number')
  .get();
```

#### Get Next Token Number
```javascript
const today = new Date().toISOString().split('T')[0];
const lastToken = await db.collection('tokens')
  .where('date', '==', today)
  .orderBy('number', 'desc')
  .limit(1)
  .get();

const nextNumber = lastToken.empty ? 1 : lastToken.docs[0].data().number + 1;
```

### 4. Prescription Queries

#### Get Patient Prescription History
```javascript
const prescriptions = await db.collection('prescriptions')
  .where('patientId', '==', patientId)
  .orderBy('createdAt', 'desc')
  .get();
```

#### Get Doctor's Prescriptions
```javascript
const doctorPrescriptions = await db.collection('prescriptions')
  .where('doctorId', '==', doctorId)
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get();
```

### 5. Billing Queries

#### Get Patient Bills
```javascript
const patientBills = await db.collection('bills')
  .where('patientId', '==', patientId)
  .orderBy('createdAt', 'desc')
  .get();
```

#### Get Daily Revenue
```javascript
const today = new Date();
const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

const dailyBills = await db.collection('bills')
  .where('createdAt', '>=', startOfDay)
  .where('createdAt', '<', endOfDay)
  .get();

const totalRevenue = dailyBills.docs.reduce((sum, doc) => sum + doc.data().totalAmount, 0);
```

## Real-time Updates

### Token Queue Updates
```javascript
const unsubscribe = db.collection('tokens')
  .where('date', '==', today)
  .onSnapshot((snapshot) => {
    const tokens = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updateTokenDisplay(tokens);
  });
```

### Patient Status Updates
```javascript
const unsubscribe = db.collection('patients')
  .where('status', '==', 'waiting')
  .onSnapshot((snapshot) => {
    const waitingPatients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updatePatientQueue(waitingPatients);
  });
```

## Data Validation Rules

### Client-side Validation

#### Patient Data
```javascript
function validatePatientData(data) {
  const errors = [];
  
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (!data.age || data.age < 1 || data.age > 150) {
    errors.push('Age must be between 1 and 150');
  }
  
  if (!['male', 'female', 'other'].includes(data.gender)) {
    errors.push('Gender must be male, female, or other');
  }
  
  if (!data.phone || !/^\d{10}$/.test(data.phone)) {
    errors.push('Phone must be 10 digits');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

#### Prescription Data
```javascript
function validatePrescriptionData(data) {
  const errors = [];
  
  if (!data.patientId) {
    errors.push('Patient must be selected');
  }
  
  if (!data.diagnosis || data.diagnosis.trim().length < 5) {
    errors.push('Diagnosis must be at least 5 characters');
  }
  
  if (!data.medications || data.medications.trim().length < 5) {
    errors.push('Medications must be specified');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### Server-side Validation (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User document validation
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId
        && request.resource.data.keys().hasAll(['name', 'email', 'role'])
        && request.resource.data.role in ['doctor', 'receptionist'];
    }
    
    // Patient document validation
    match /patients/{patientId} {
      allow read, write: if request.auth != null
        && request.resource.data.keys().hasAll(['name', 'age', 'gender', 'phone'])
        && request.resource.data.age is number
        && request.resource.data.age > 0;
    }
    
    // Prescription validation
    match /prescriptions/{prescriptionId} {
      allow read, write: if request.auth != null
        && request.resource.data.keys().hasAll(['patientId', 'diagnosis', 'medications'])
        && exists(/databases/$(database)/documents/patients/$(request.resource.data.patientId));
    }
  }
}
```

## Performance Optimization

### Indexing Strategy

#### Composite Indexes
```javascript
// For efficient token queries
{
  collection: 'tokens',
  fields: [
    { field: 'date', order: 'ascending' },
    { field: 'number', order: 'ascending' }
  ]
}

// For patient search
{
  collection: 'patients',
  fields: [
    { field: 'status', order: 'ascending' },
    { field: 'registrationDate', order: 'descending' }
  ]
}
```

### Query Optimization

#### Pagination
```javascript
// First page
const firstPage = await db.collection('patients')
  .orderBy('registrationDate', 'desc')
  .limit(20)
  .get();

// Next page
const lastDoc = firstPage.docs[firstPage.docs.length - 1];
const nextPage = await db.collection('patients')
  .orderBy('registrationDate', 'desc')
  .startAfter(lastDoc)
  .limit(20)
  .get();
```

#### Cached Queries
```javascript
// Enable offline persistence
firebase.firestore().enablePersistence();

// Cached read
const snapshot = await db.collection('patients')
  .doc(patientId)
  .get({ source: 'cache' });
```

## Error Handling

### Common Error Scenarios

#### Permission Denied
```javascript
try {
  await db.collection('patients').add(data);
} catch (error) {
  if (error.code === 'permission-denied') {
    showMessage('You do not have permission to perform this action', 'error');
  }
}
```

#### Network Errors
```javascript
try {
  await db.collection('patients').get();
} catch (error) {
  if (error.code === 'unavailable') {
    showMessage('Network error. Please check your connection', 'error');
  }
}
```

#### Validation Errors
```javascript
try {
  await db.collection('patients').add(data);
} catch (error) {
  if (error.code === 'invalid-argument') {
    showMessage('Invalid data provided', 'error');
  }
}
```

## Security Considerations

### Data Access Patterns

1. **Role-based Access**: Users can only access data relevant to their role
2. **Owner-based Access**: Users can only modify their own documents
3. **Authenticated Access**: All operations require authentication

### Sensitive Data Handling

1. **No PHI in logs**: Never log personal health information
2. **Encrypted transmission**: All data transmitted over HTTPS
3. **Access logging**: Log all access to sensitive collections

### Example Security Rules
```javascript
// Restrict patient access based on role
match /patients/{patientId} {
  allow read, write: if request.auth != null 
    && (getUserRole(request.auth.uid) == 'doctor' 
        || getUserRole(request.auth.uid) == 'receptionist');
}

function getUserRole(userId) {
  return get(/databases/$(database)/documents/users/$(userId)).data.role;
}
```
