// Receptionist Module
class ReceptionistModule {
    constructor() {
        this.tokens = [];
        this.patients = [];
        this.init();
    }

    init() {
        this.setupFormListeners();
    }

    setupFormListeners() {
        // Patient registration form is handled in patient.js
        // Token management is handled here
    }

    async loadDashboard() {
        await this.loadTokenStats();
        await this.loadTodaysTokens();
        await this.loadPatientsForBilling();
        await this.loadRecentBills();
    }

    async loadTokenStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Get all tokens for today
            const tokensSnapshot = await db.collection('tokens')
                .where('date', '==', today)
                .get();

            const tokens = tokensSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calculate stats
            const totalTokens = tokens.length;
            const waitingPatients = tokens.filter(t => t.status === 'waiting').length;
            const currentToken = tokens.length > 0 ? 
                Math.min(...tokens.filter(t => t.status === 'waiting').map(t => t.number)) || '--' : 
                '--';

            // Update UI
            document.getElementById('totalTokens').textContent = totalTokens;
            document.getElementById('waitingPatients').textContent = waitingPatients;
            document.getElementById('currentToken').textContent = currentToken;

            this.tokens = tokens;

        } catch (error) {
            console.error('Error loading token stats:', error);
        }
    }

    async loadTodaysTokens() {
        const tokensList = document.getElementById('tokensList');
        if (!tokensList) return;

        tokensList.innerHTML = '';

        if (this.tokens.length === 0) {
            tokensList.innerHTML = `
                <div class="no-tokens">
                    <i class="fas fa-ticket-alt"></i>
                    <h3>No tokens generated today</h3>
                    <p>Register patients to generate tokens.</p>
                </div>
            `;
            return;
        }

        // Sort tokens by number
        const sortedTokens = this.tokens.sort((a, b) => a.number - b.number);

        sortedTokens.forEach(token => {
            const tokenCard = this.createTokenCard(token);
            tokensList.appendChild(tokenCard);
        });
    }

    createTokenCard(token) {
        const card = document.createElement('div');
        card.className = 'token-card fade-in';

        const timeCreated = token.time ? 
            token.time.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
            'Unknown';

        card.innerHTML = `
            <div class="token-info">
                <h4>${token.patientName}</h4>
                <p>${token.patientPhone}</p>
                <p class="token-time">Generated: ${timeCreated}</p>
                <p class="visit-type">${this.capitalizeFirst(token.visitType)}</p>
            </div>
            <div class="token-badge ${token.status}">
                ${token.number}
            </div>
        `;

        return card;
    }

    async loadPatientsForBilling() {
        try {
            // Load consulted patients who haven't been billed yet
            const patientsSnapshot = await db.collection('patients')
                .where('status', '==', 'consulted')
                .get();

            // Sort patients by consultedAt in JavaScript (to avoid composite index requirement)
            const patients = patientsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => {
                    // Sort by consultedAt desc (most recent first)
                    const aTime = a.consultedAt ? a.consultedAt.toDate() : new Date(0);
                    const bTime = b.consultedAt ? b.consultedAt.toDate() : new Date(0);
                    return bTime - aTime;
                });

            // Update billing patient select
            const billingPatientSelect = document.getElementById('billingPatient');
            if (billingPatientSelect) {
                billingPatientSelect.innerHTML = '<option value="">Select Patient</option>';
                
                patients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = `${patient.name} (${patient.phone})`;
                    billingPatientSelect.appendChild(option);
                });
            }

        } catch (error) {
            console.error('Error loading patients for billing:', error);
        }
    }

    async loadRecentBills() {
        try {
            const billsSnapshot = await db.collection('bills')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            const bills = billsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.displayRecentBills(bills);

        } catch (error) {
            console.error('Error loading recent bills:', error);
        }
    }

    displayRecentBills(bills) {
        const billsList = document.getElementById('billsList');
        if (!billsList) return;

        billsList.innerHTML = '';

        if (bills.length === 0) {
            billsList.innerHTML = `
                <div class="no-bills">
                    <i class="fas fa-receipt"></i>
                    <p>No bills generated yet.</p>
                </div>
            `;
            return;
        }

        bills.forEach(bill => {
            const billItem = this.createBillItem(bill);
            billsList.appendChild(billItem);
        });
    }

    createBillItem(bill) {
        const item = document.createElement('div');
        item.className = 'bill-item fade-in';

        const billDate = bill.createdAt ? 
            bill.createdAt.toDate().toLocaleDateString() : 
            'Today';

        item.innerHTML = `
            <div class="bill-info">
                <h4>${bill.patientName}</h4>
                <p>Bill #${bill.billNumber}</p>
                <p class="bill-date">${billDate}</p>
            </div>
            <div class="bill-amount">₹${bill.totalAmount}</div>
        `;

        return item;
    }

    showReceptionistTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('#receptionistDashboard .tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(`receptionist${this.capitalizeFirst(tabName)}`).classList.add('active');

        // Update navigation
        document.querySelectorAll('#receptionistDashboard .nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[onclick="showReceptionistTab('${tabName}')"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Load specific data based on tab
        if (tabName === 'tokens') {
            this.loadTokenStats();
            this.loadTodaysTokens();
        } else if (tabName === 'billing') {
            this.loadPatientsForBilling();
            this.loadRecentBills();
        } else if (tabName === 'patients') {
            this.loadAllPatients();
        }
    }

    async loadAllPatients() {
        try {
            const patientsSnapshot = await db.collection('patients')
                .orderBy('registrationDate', 'desc')
                .limit(50)
                .get();

            const patients = patientsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.displayAllPatients(patients);

        } catch (error) {
            console.error('Error loading all patients:', error);
        }
    }

    displayAllPatients(patients) {
        const allPatientsList = document.getElementById('allPatientsList');
        if (!allPatientsList) return;

        allPatientsList.innerHTML = '';

        if (patients.length === 0) {
            allPatientsList.innerHTML = `
                <div class="no-patients">
                    <i class="fas fa-users"></i>
                    <p>No patients found.</p>
                </div>
            `;
            return;
        }

        patients.forEach(patient => {
            const patientItem = this.createPatientListItem(patient);
            allPatientsList.appendChild(patientItem);
        });
    }

    createPatientListItem(patient) {
        const item = document.createElement('div');
        item.className = 'patient-card fade-in';

        const registrationDate = patient.registrationDate ? 
            patient.registrationDate.toDate().toLocaleDateString() : 
            'Today';

        const statusClass = patient.status || 'waiting';
        const statusText = this.capitalizeFirst(patient.status || 'Waiting');

        item.innerHTML = `
            <div class="patient-header">
                <div class="patient-name">${patient.name}</div>
                <div class="patient-status ${statusClass}">${statusText}</div>
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
                    <i class="fas fa-venus-mars"></i>
                    <span>${this.capitalizeFirst(patient.gender)}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>${registrationDate}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-stethoscope"></i>
                    <span>${this.capitalizeFirst(patient.visitType)}</span>
                </div>
            </div>
            <div class="patient-actions">
                <button class="btn-small btn-primary-small" onclick="receptionistModule.viewPatientDetails('${patient.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${patient.status === 'consulted' ? `
                    <button class="btn-small btn-secondary-small" onclick="receptionistModule.generateBillForPatient('${patient.id}')">
                        <i class="fas fa-receipt"></i> Generate Bill
                    </button>
                ` : ''}
            </div>
        `;

        return item;
    }

    async viewPatientDetails(patientId) {
        try {
            const patientDoc = await db.collection('patients').doc(patientId).get();
            if (!patientDoc.exists) {
                authModule.showMessage('Patient not found', 'error');
                return;
            }

            const patient = { id: patientDoc.id, ...patientDoc.data() };

            // Get patient's recent prescriptions
            const prescriptionsSnapshot = await db.collection('prescriptions')
                .where('patientId', '==', patientId)
                .get();

            const prescriptions = prescriptionsSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .sort((a, b) => new Date(b.createdAt?.toDate?.() || b.createdAt) - new Date(a.createdAt?.toDate?.() || a.createdAt))
                .slice(0, 5);

            this.showPatientDetailsModal(patient, prescriptions);

        } catch (error) {
            console.error('Error loading patient details:', error);
            authModule.showMessage('Error loading patient details', 'error');
        }
    }

    showPatientDetailsModal(patient, prescriptions) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('patientDetailsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'patientDetailsModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }

        const registrationDate = patient.registrationDate ? 
            patient.registrationDate.toDate().toLocaleDateString() : 
            'Today';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Patient Details</h2>
                    <span class="close" onclick="receptionistModule.closeModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="patient-details">
                        <h3>${patient.name}</h3>
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
                                <strong>Status:</strong> ${this.capitalizeFirst(patient.status || 'Waiting')}
                            </div>
                            <div class="detail-item">
                                <strong>Registration:</strong> ${registrationDate}
                            </div>
                            <div class="detail-item">
                                <strong>Visit Type:</strong> ${this.capitalizeFirst(patient.visitType)}
                            </div>
                            <div class="detail-item full-width">
                                <strong>Address:</strong> ${patient.address || 'Not provided'}
                            </div>
                            <div class="detail-item full-width">
                                <strong>Emergency Contact:</strong> ${patient.emergencyContact || 'Not provided'}
                            </div>
                        </div>
                    </div>
                    
                    ${prescriptions.length > 0 ? `
                        <div class="recent-prescriptions">
                            <h4>Recent Prescriptions</h4>
                            ${prescriptions.map(p => `
                                <div class="prescription-summary">
                                    <div class="prescription-date">${p.date}</div>
                                    <div class="prescription-diagnosis">${p.diagnosis}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('patientDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    generateBillForPatient(patientId) {
        // Switch to billing tab and pre-select patient
        this.showReceptionistTab('billing');
        setTimeout(() => {
            document.getElementById('billingPatient').value = patientId;
        }, 100);
    }

    async searchPatients() {
        const query = document.getElementById('patientSearch').value.trim();
        
        if (!query) {
            this.loadAllPatients();
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

            this.displayAllPatients(uniquePatients);

        } catch (error) {
            console.error('Error searching patients:', error);
            authModule.showMessage('Error searching patients', 'error');
        }
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize receptionist module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const receptionistModule = new ReceptionistModule();
        window.receptionistModule = receptionistModule;
    });
} else {
    // DOM already loaded
    const receptionistModule = new ReceptionistModule();
    window.receptionistModule = receptionistModule;
}
