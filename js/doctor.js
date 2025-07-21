// Doctor Module
class DoctorModule {
    constructor() {
        this.prescriptions = [];
        this.init();
    }

    init() {
        this.setupFormListeners();
        this.setCurrentDate();
    }

    setupFormListeners() {
        // Prescription form
        document.getElementById('prescriptionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePrescription();
        });
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const prescriptionDateInput = document.getElementById('prescriptionDate');
        if (prescriptionDateInput) {
            prescriptionDateInput.value = today;
        }
    }

    async loadPatients() {
        try {
            // Load today's tokens for waiting patients
            const today = new Date().toISOString().split('T')[0];
            
            // First query: Get tokens by date and status (simpler query)
            const tokensSnapshot = await db.collection('tokens')
                .where('date', '==', today)
                .where('status', '==', 'waiting')
                .get();

            // Sort tokens by number in JavaScript (to avoid composite index requirement)
            const tokens = tokensSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => a.number - b.number);

            // Load patient details for each token
            const patientsPromises = tokens.map(async (token) => {
                const patientDoc = await db.collection('patients').doc(token.patientId).get();
                if (patientDoc.exists) {
                    return {
                        id: patientDoc.id,
                        ...patientDoc.data(),
                        tokenNumber: token.number
                    };
                }
                return null;
            });

            const patients = (await Promise.all(patientsPromises)).filter(p => p !== null);
            
            this.displayPatientsForDoctor(patients);
            this.updatePrescriptionPatientOptions(patients);

        } catch (error) {
            console.error('Error loading patients for doctor:', error);
        }
    }

    displayPatientsForDoctor(patients) {
        const patientsGrid = document.getElementById('patientsGrid');
        if (!patientsGrid) return;

        patientsGrid.innerHTML = '';

        if (patients.length === 0) {
            patientsGrid.innerHTML = `
                <div class="no-patients">
                    <i class="fas fa-user-injured"></i>
                    <h3>No patients waiting</h3>
                    <p>All patients have been consulted for today.</p>
                </div>
            `;
            return;
        }

        patients.forEach(patient => {
            const patientCard = this.createDoctorPatientCard(patient);
            patientsGrid.appendChild(patientCard);
        });
    }

    createDoctorPatientCard(patient) {
        const card = document.createElement('div');
        card.className = 'patient-card fade-in';
        
        const registrationDate = patient.registrationDate ? 
            patient.registrationDate.toDate().toLocaleDateString() : 
            'Today';
        
        card.innerHTML = `
            <div class="patient-header">
                <div class="patient-name">${patient.name}</div>
                <div class="token-number">Token: ${patient.tokenNumber}</div>
            </div>
            <div class="patient-info">
                <div class="info-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${patient.age} years old</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-venus-mars"></i>
                    <span>${this.capitalizeFirst(patient.gender)}</span>
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
                    <span>${this.capitalizeFirst(patient.visitType)}</span>
                </div>
                ${patient.address ? `
                    <div class="info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${patient.address}</span>
                    </div>
                ` : ''}
            </div>
            <div class="patient-actions">
                <button class="btn-small btn-primary-small" onclick="doctorModule.viewPatientHistory('${patient.id}')">
                    <i class="fas fa-history"></i> History
                </button>
                <button class="btn-small btn-primary-small" onclick="doctorModule.startConsultation('${patient.id}')">
                    <i class="fas fa-stethoscope"></i> Consult
                </button>
            </div>
        `;
        
        return card;
    }

    updatePrescriptionPatientOptions(patients) {
        const prescriptionPatientSelect = document.getElementById('prescriptionPatient');
        if (!prescriptionPatientSelect) return;

        prescriptionPatientSelect.innerHTML = '<option value="">Select Patient</option>';
        
        patients.forEach(patient => {
            const option = document.createElement('option');
            option.value = patient.id;
            option.textContent = `Token ${patient.tokenNumber} - ${patient.name} (${patient.phone})`;
            prescriptionPatientSelect.appendChild(option);
        });
    }

    startConsultation(patientId) {
        // Switch to prescription tab and pre-select patient
        this.showDoctorTab('prescriptions');
        document.getElementById('prescriptionPatient').value = patientId;
    }

    async savePrescription() {
        const prescriptionData = {
            patientId: document.getElementById('prescriptionPatient').value,
            date: document.getElementById('prescriptionDate').value,
            diagnosis: document.getElementById('diagnosis').value,
            medications: document.getElementById('medications').value,
            instructions: document.getElementById('instructions').value,
            followupDate: document.getElementById('followupDate').value,
            doctorId: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!prescriptionData.patientId) {
            authModule.showMessage('Please select a patient', 'error');
            return;
        }

        try {
            // Save prescription
            await db.collection('prescriptions').add(prescriptionData);

            // Update patient status to consulted
            await db.collection('patients').doc(prescriptionData.patientId).update({
                status: 'consulted',
                consultedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastVisit: prescriptionData.date
            });

            // Update token status
            const today = new Date().toISOString().split('T')[0];
            const tokensSnapshot = await db.collection('tokens')
                .where('patientId', '==', prescriptionData.patientId)
                .where('date', '==', today)
                .get();

            tokensSnapshot.forEach(async (doc) => {
                await db.collection('tokens').doc(doc.id).update({
                    status: 'completed',
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            });

            // Clear form
            document.getElementById('prescriptionForm').reset();
            this.setCurrentDate();

            authModule.showMessage('Prescription saved successfully!', 'success');

            // Refresh patient list
            this.loadPatients();

            // Switch back to patients tab
            this.showDoctorTab('patients');

        } catch (error) {
            console.error('Error saving prescription:', error);
            authModule.showMessage('Error saving prescription. Please try again.', 'error');
        }
    }

    async viewPatientHistory(patientId) {
        try {
            // Get patient details
            const patientDoc = await db.collection('patients').doc(patientId).get();
            if (!patientDoc.exists) {
                authModule.showMessage('Patient not found', 'error');
                return;
            }

            const patient = { id: patientDoc.id, ...patientDoc.data() };

            // Get patient's prescription history
            const prescriptionsSnapshot = await db.collection('prescriptions')
                .where('patientId', '==', patientId)
                .get();

            const prescriptions = prescriptionsSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt));

            this.displayPatientHistory(patient, prescriptions);

        } catch (error) {
            console.error('Error loading patient history:', error);
            authModule.showMessage('Error loading patient history', 'error');
        }
    }

    displayPatientHistory(patient, prescriptions) {
        const historyResults = document.getElementById('historyResults');
        if (!historyResults) return;

        const registrationDate = patient.registrationDate ? 
            patient.registrationDate.toDate().toLocaleDateString() : 
            'Unknown';

        historyResults.innerHTML = `
            <div class="history-item">
                <div class="history-header">
                    <h3>${patient.name}</h3>
                    <span class="patient-status ${patient.status}">${this.capitalizeFirst(patient.status || 'Active')}</span>
                </div>
                <div class="history-content">
                    <div class="patient-details">
                        <h4>Patient Information</h4>
                        <div class="details-grid">
                            <div class="detail-item">
                                <strong>Age:</strong> ${patient.age} years
                            </div>
                            <div class="detail-item">
                                <strong>Gender:</strong> ${this.capitalizeFirst(patient.gender)}
                            </div>
                            <div class="detail-item">
                                <strong>Phone:</strong> ${patient.phone}
                            </div>
                            <div class="detail-item">
                                <strong>Registration:</strong> ${registrationDate}
                            </div>
                            <div class="detail-item">
                                <strong>Address:</strong> ${patient.address || 'Not provided'}
                            </div>
                            <div class="detail-item">
                                <strong>Emergency Contact:</strong> ${patient.emergencyContact || 'Not provided'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="prescriptions-history">
                        <h4>Prescription History (${prescriptions.length} visits)</h4>
                        <div class="prescriptions-list">
                            ${prescriptions.length > 0 ? 
                                prescriptions.map(prescription => `
                                    <div class="prescription-item">
                                        <div class="prescription-header">
                                            <strong>Date: ${prescription.date}</strong>
                                            <span class="prescription-time">
                                                ${prescription.createdAt ? 
                                                    prescription.createdAt.toDate().toLocaleTimeString() : 
                                                    'Time not available'}
                                            </span>
                                        </div>
                                        <div class="prescription-content">
                                            <div class="prescription-field">
                                                <strong>Diagnosis:</strong>
                                                <p>${prescription.diagnosis}</p>
                                            </div>
                                            <div class="prescription-field">
                                                <strong>Medications:</strong>
                                                <p>${prescription.medications}</p>
                                            </div>
                                            ${prescription.instructions ? `
                                                <div class="prescription-field">
                                                    <strong>Instructions:</strong>
                                                    <p>${prescription.instructions}</p>
                                                </div>
                                            ` : ''}
                                            ${prescription.followupDate ? `
                                                <div class="prescription-field">
                                                    <strong>Follow-up Date:</strong>
                                                    <p>${prescription.followupDate}</p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                `).join('') : 
                                '<div class="no-prescriptions"><p>No prescription history found.</p></div>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Switch to history tab
        this.showDoctorTab('history');
    }

    async searchPatientHistory() {
        const query = document.getElementById('historySearch').value.trim();
        
        if (!query) {
            document.getElementById('historyResults').innerHTML = 
                '<p>Please enter a patient name or phone number to search.</p>';
            return;
        }

        try {
            // Search by name
            const nameSnapshot = await db.collection('patients')
                .orderBy('name')
                .startAt(query.toLowerCase())
                .endAt(query.toLowerCase() + '\uf8ff')
                .get();

            // Search by phone
            const phoneSnapshot = await db.collection('patients')
                .where('phone', '>=', query)
                .where('phone', '<=', query + '\uf8ff')
                .get();

            // Combine results and remove duplicates
            const allDocs = [...nameSnapshot.docs, ...phoneSnapshot.docs];
            const uniquePatients = allDocs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((patient, index, self) => 
                    index === self.findIndex(p => p.id === patient.id)
                );

            if (uniquePatients.length === 0) {
                document.getElementById('historyResults').innerHTML = 
                    '<p>No patients found matching your search.</p>';
                return;
            }

            // Display search results
            this.displaySearchResults(uniquePatients);

        } catch (error) {
            console.error('Error searching patient history:', error);
            authModule.showMessage('Error searching patients', 'error');
        }
    }

    displaySearchResults(patients) {
        const historyResults = document.getElementById('historyResults');
        
        historyResults.innerHTML = `
            <div class="search-results">
                <h4>Search Results (${patients.length} patients found)</h4>
                <div class="patients-list">
                    ${patients.map(patient => `
                        <div class="patient-search-item" onclick="doctorModule.viewPatientHistory('${patient.id}')">
                            <div class="patient-search-header">
                                <strong>${patient.name}</strong>
                                <span class="patient-phone">${patient.phone}</span>
                            </div>
                            <div class="patient-search-details">
                                <span>${patient.age} years, ${this.capitalizeFirst(patient.gender)}</span>
                                <span class="patient-status ${patient.status}">${this.capitalizeFirst(patient.status || 'Active')}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showDoctorTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('#doctorDashboard .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`doctor${this.capitalizeFirst(tabName)}`).classList.add('active');

        // Update navigation
        document.querySelectorAll('#doctorDashboard .nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[onclick="showDoctorTab('${tabName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize doctor module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const doctorModule = new DoctorModule();
        window.doctorModule = doctorModule;
    });
} else {
    // DOM already loaded
    const doctorModule = new DoctorModule();
    window.doctorModule = doctorModule;
}
