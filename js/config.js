// Firebase Configuration
// Production Firebase config for clinic-management-system-ed66f
const firebaseConfig = {
    apiKey: "AIzaSyB5HRgG23pmJEDz62gbmMyNhnJ7ra28088",
  authDomain: "clinic-management-system-ed66f.firebaseapp.com",
  projectId: "clinic-management-system-ed66f",
  storageBucket: "clinic-management-system-ed66f.firebasestorage.app",
  messagingSenderId: "654090269547",
  appId: "1:654090269547:web:17915150711cbdc0f9522e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();

// Export for use in other modules
window.db = db;
window.auth = auth;
