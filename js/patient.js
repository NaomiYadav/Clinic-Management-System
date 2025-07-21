// Patient Management Module
class PatientModule {
    constructor() {
        this.patients = [];
        this.tokens = [];
        this.init();
    }

    init() {
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Patient registration form
        document.getElementById('patientRegistrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerPatient();
        });
    }

    async registerPatient() {
        const patientData = {
            name: document.getElementById('patientName').value,
            age: parseInt(document.getElementById('patientAge').value),
            gender: document.getElementById('patientGender').value,
            phone: document.getElementById('patientPhone').value,
            address: document.getElementById('patientAddress').value,
            emergencyContact: document.getElementById('emergencyContact').value,
            visitType: document.getElementById('visitType').value,
            registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'waiting'
        };

        try {
            // Add patient to database
            const patientRef = await db.collection('patients').add(patientData);
            
            // Generate token
            const token = await this.generateToken(patientRef.id, patientData);
            
            // Clear form
            document.getElementById('patientRegistrationForm').reset();
            
            // Show success message
            authModule.showMessage(`Patient registered successfully! Token Number: ${token.number}`, 'success');
            
            // Refresh receptionist dashboard if it exists
            if (window.receptionistModule && typeof receptionistModule.loadDashboard === 'function') {
                receptionistModule.loadDashboard();
            }
            
        } catch (error) {
            console.error('Error registering patient:', error);
            authModule.showMessage('Error registering patient. Please try again.', 'error');
        }
    }

    async generateToken(patientId, patientData) {
        // Get today's date for token numbering
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        // Get existing tokens for today
        const tokensSnapshot = await db.collection('tokens')
            .where('date', '==', dateStr)
            .get();
        
        let tokenNumber = 1;
        if (!tokensSnapshot.empty) {
            // Sort in JavaScript to get the highest token number
            const sortedTokens = tokensSnapshot.docs
                .map(doc => doc.data())
                .sort((a, b) => b.number - a.number);
            
            if (sortedTokens.length > 0) {
                tokenNumber = sortedTokens[0].number + 1;
            }
        }
        
        // Create token
        const tokenData = {
            number: tokenNumber,
            patientId: patientId,
            patientName: patientData.name,
            patientPhone: patientData.phone,
            visitType: patientData.visitType,
            date: dateStr,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'waiting',
            createdBy: auth.currentUser.uid
        };
        
        await db.collection('tokens').add(tokenData);
        
        return tokenData;
    }

    async loadPatients() {
        try {
            const patientsSnapshot = await db.collection('patients')
                .orderBy('registrationDate', 'desc')
                .get();
            
            this.patients = patientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.displayPatients();
        } catch (error) {
            console.error('Error loading patients:', error);
        }
    }

    displayPatients() {
        const patientsGrid = document.getElementById('patientsGrid');
        const prescriptionPatientSelect = document.getElementById('prescriptionPatient');
        
        if (!patientsGrid) return;
        
        patientsGrid.innerHTML = '';
        prescriptionPatientSelect.innerHTML = '<option value="">Select Patient</option>';
        
        // Filter waiting patients for doctor view
        const waitingPatients = this.patients.filter(patient => patient.status === 'waiting');
        
        waitingPatients.forEach(patient => {
            // Create patient card
            const patientCard = this.createPatientCard(patient);
            patientsGrid.appendChild(patientCard);
            
            // Add to prescription select
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `${patient.name} (${patient.phone})`;
            prescriptionPatientSelect.appendChild(option);
        });
    }

    createPatientCard(patient) {
        const card = document.createElement('div');
        card.className = 'patient-card fade-in';
        
        const registrationDate = patient.registrationDate ? 
            patient.registrationDate.toDate().toLocaleDateString() : 
            'Today';
        
        card.innerHTML = `
            <div class="patient-header">
                <div class="patient-name">${patient.name}</div>
                <div class="token-number">Token: ${this.getPatientToken(patient.id)}</div>
            </div>
            <div class="patient-info">
                <div class="info-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${patient.age} years old</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-venus-mars"></i>
                    <span>${patient.gender}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <span>${patient.phone}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${registrationDate}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-stethoscope"></i>
                    <span>${patient.visitType}</span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn-small btn-primary-small" onclick="patientModule.viewPatientHistory('${patient.id}')">
                    View History
                </button>
                <button class="btn-small btn-primary-small" onclick="patientModule.markAsConsulted('${patient.id}')">
                    Mark Consulted
                </button>
            </div>
        `;
        
        return card;
    }

    getPatientToken(patientId) {
        const token = this.tokens.find(t => t.patientId === patientId);
        return token ? token.number : '--';
    }

    async markAsConsulted(patientId) {
        try {
            await db.collection('patients').doc(patientId).update({
                status: 'consulted',
                consultedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update token status
            const tokenSnapshot = await db.collection('tokens')
                .where('patientId', '==', patientId)
                .get();
            
            tokenSnapshot.forEach(async (doc) => {
                await db.collection('tokens').doc(doc.id).update({
                    status: 'completed'
                });
            });
            
            authModule.showMessage('Patient marked as consulted', 'success');
            this.loadPatients();
            
        } catch (error) {
            console.error('Error updating patient status:', error);
            authModule.showMessage('Error updating patient status', 'error');
        }
    }

    async viewPatientHistory(patientId) {
        try {
            const patient = this.patients.find(p => p.id === patientId);
            if (!patient) return;
            
            // Get patient's prescription history
            const prescriptionsSnapshot = await db.collection('prescriptions')
                .where('patientId', '==', patientId)
                .orderBy('date', 'desc')
                .get();
            
            const prescriptions = prescriptionsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.displayPatientHistory(patient, prescriptions);
            
        } catch (error) {
            console.error('Error loading patient history:', error);
        }
    }

    displayPatientHistory(patient, prescriptions) {
        const historyResults = document.getElementById('historyResults');
        if (!historyResults) return;
        
        historyResults.innerHTML = `
            <div class="history-item">
                <div class="history-header">
                    <h3>${patient.name}</h3>
                    <span>${patient.phone}</span>
                </div>
                <div class="history-content">
                    <p><strong>Age:</strong> ${patient.age}</p>
                    <p><strong>Gender:</strong> ${patient.gender}</p>
                    <p><strong>Address:</strong> ${patient.address}</p>
                    <p><strong>Emergency Contact:</strong> ${patient.emergencyContact}</p>
                </div>
                
                <h4>Prescription History:</h4>
                <div class="prescriptions-list">
                    ${prescriptions.length > 0 ? 
                        prescriptions.map(p => `
                            <div class="prescription-item">
                                <p><strong>Date:</strong> ${p.date}</p>
                                <p><strong>Diagnosis:</strong> ${p.diagnosis}</p>
                                <p><strong>Medications:</strong> ${p.medications}</p>
                                <p><strong>Instructions:</strong> ${p.instructions}</p>
                            </div>
                        `).join('') : 
                        '<p>No prescription history found.</p>'
                    }
                </div>
            </div>
        `;
        
        // Switch to history tab
        showDoctorTab('history');
    }

    async searchPatients(query) {
        try {
            if (!query.trim()) {
                this.displayAllPatients();
                return;
            }
            
            // Search by name or phone
            const patientsSnapshot = await db.collection('patients')
                .orderBy('name')
                .startAt(query)
                .endAt(query + '\uf8ff')
                .get();
            
            const phoneSnapshot = await db.collection('patients')
                .where('phone', '>=', query)
                .where('phone', '<=', query + '\uf8ff')
                .get();
            
            const patients = [...patientsSnapshot.docs, ...phoneSnapshot.docs]
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((patient, index, self) => 
                    index === self.findIndex(p => p.id === patient.id)
                );
            
            this.displaySearchResults(patients);
            
        } catch (error) {
            console.error('Error searching patients:', error);
        }
    }

    displaySearchResults(patients) {
        const allPatientsList = document.getElementById('allPatientsList');
        if (!allPatientsList) return;
        
        allPatientsList.innerHTML = '';
        
        patients.forEach(patient => {
            const patientItem = document.createElement('div');
            patientItem.className = 'patient-card';
            patientItem.innerHTML = `
                <div class="patient-header">
                    <div class="patient-name">${patient.name}</div>
                    <div class="patient-status ${patient.status}">${patient.status}</div>
                </div>
                <div class="patient-info">
                    <div class="info-item">
                        <i class="fas fa-phone"></i>
                        <span>${patient.phone}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-birthday-cake"></i>
                        <span>${patient.age} years</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${patient.registrationDate ? 
                            patient.registrationDate.toDate().toLocaleDateString() : 
                            'Today'}</span>
                    </div>
                </div>
                <div class="patient-actions">
                    <button class="btn-small btn-primary-small" onclick="patientModule.viewPatientHistory('${patient.id}')">
                        View Details
                    </button>
                </div>
            `;
            allPatientsList.appendChild(patientItem);
        });
    }

    async displayAllPatients() {
        try {
            const patientsSnapshot = await db.collection('patients')
                .orderBy('registrationDate', 'desc')
                .limit(50)
                .get();
            
            const patients = patientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            this.displaySearchResults(patients);
            
        } catch (error) {
            console.error('Error loading all patients:', error);
        }
    }
}

// Initialize patient module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const patientModule = new PatientModule();
        window.patientModule = patientModule;
    });
} else {
    // DOM already loaded
    const patientModule = new PatientModule();
    window.patientModule = patientModule;
}
