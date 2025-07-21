// Authentication Module
class AuthModule {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserRole(user.uid);
            } else {
                this.currentUser = null;
                this.userRole = null;
                this.showSection('login');
            }
        });

        // Setup form listeners
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Doctor login form
        document.getElementById('doctorLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginDoctor();
        });

        // Receptionist login form
        document.getElementById('receptionistLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginReceptionist();
        });

        // Registration form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerUser();
        });

        // Role change listener for registration
        document.getElementById('regRole').addEventListener('change', (e) => {
            const licenseGroup = document.getElementById('licenseGroup');
            if (e.target.value === 'doctor') {
                licenseGroup.style.display = 'block';
                document.getElementById('regLicense').required = true;
            } else {
                licenseGroup.style.display = 'none';
                document.getElementById('regLicense').required = false;
            }
        });
    }

    async loginDoctor() {
        const email = document.getElementById('doctorEmail').value;
        const password = document.getElementById('doctorPassword').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // User role will be loaded in onAuthStateChanged
        } catch (error) {
            this.showMessage('Invalid credentials. Please try again.', 'error');
        }
    }

    async loginReceptionist() {
        const email = document.getElementById('receptionistEmail').value;
        const password = document.getElementById('receptionistPassword').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // User role will be loaded in onAuthStateChanged
        } catch (error) {
            this.showMessage('Invalid credentials. Please try again.', 'error');
        }
    }

    async registerUser() {
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        const license = document.getElementById('regLicense').value;

        try {
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Store user data in Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                role: role,
                license: role === 'doctor' ? license : null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showMessage('Registration successful! Please login.', 'success');
            this.showSection('login');
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async loadUserRole(uid) {
        try {
            const userDoc = await db.collection('users').doc(uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.userRole = userData.role;
                
                if (userData.role === 'doctor') {
                    document.getElementById('doctorName').textContent = userData.name;
                    this.showSection('doctorDashboard');
                    // Wait for doctor module to be available, then load patients
                    this.waitForModuleAndExecute('doctorModule', 'loadPatients');
                } else if (userData.role === 'receptionist') {
                    document.getElementById('receptionistName').textContent = userData.name;
                    this.showSection('receptionistDashboard');
                    // Wait for receptionist module to be available, then load dashboard
                    this.waitForModuleAndExecute('receptionistModule', 'loadDashboard');
                }
            }
        } catch (error) {
            console.error('Error loading user role:', error);
        }
    }

    // Helper method to wait for module availability
    waitForModuleAndExecute(moduleName, methodName, maxAttempts = 50) {
        let attempts = 0;
        const checkModule = () => {
            attempts++;
            if (window[moduleName] && typeof window[moduleName][methodName] === 'function') {
                // Module is available, execute the method
                window[moduleName][methodName]();
            } else if (attempts < maxAttempts) {
                // Try again after a short delay
                setTimeout(checkModule, 100);
            } else {
                console.error(`Module ${moduleName} or method ${methodName} not available after ${maxAttempts} attempts`);
            }
        };
        checkModule();
    }

    async logout() {
        try {
            await auth.signOut();
            this.showMessage('Logged out successfully', 'success');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    showMessage(message, type) {
        // Create or update message element
        let messageEl = document.querySelector('.message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'message';
            document.body.insertBefore(messageEl, document.body.firstChild);
        }
        
        messageEl.textContent = message;
        messageEl.className = `message ${type} show`;
        
        // Hide message after 3 seconds
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show requested section
        document.getElementById(sectionId).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current nav item if exists
        const navLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
    }
}

// Initialize authentication module
const authModule = new AuthModule();
window.authModule = authModule;
