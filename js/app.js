// Main Application Module
class ClinicManagementApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.setupModalHandlers();
        this.addCustomStyles();
    }

    setupGlobalEventListeners() {
        // Tab switching functions - make them global
        window.switchTab = this.switchTab.bind(this);
        window.showSection = this.showSection.bind(this);
        window.showRegister = this.showRegister.bind(this);
        window.showDoctorTab = this.showDoctorTab.bind(this);
        window.showReceptionistTab = this.showReceptionistTab.bind(this);
        window.logout = this.logout.bind(this);
        window.searchPatientHistory = this.searchPatientHistory.bind(this);
        window.searchPatients = this.searchPatients.bind(this);
    }

    setupModalHandlers() {
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
    }

    addCustomStyles() {
        // Add modal styles
        const modalStyles = `
            <style>
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(5px);
                }

                .modal-content {
                    background-color: white;
                    margin: 5% auto;
                    padding: 0;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    animation: modalSlideIn 0.3s ease-out;
                }

                .bill-modal-content {
                    max-width: 800px;
                }

                @keyframes modalSlideIn {
                    from {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .modal-header {
                    padding: 20px 30px;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 15px 15px 0 0;
                }

                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }

                .close {
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    background: none;
                    border: none;
                    padding: 0;
                    line-height: 1;
                }

                .close:hover {
                    opacity: 0.7;
                }

                .modal-body {
                    padding: 30px;
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin-bottom: 20px;
                }

                .detail-item {
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                }

                .detail-item.full-width {
                    grid-column: 1 / -1;
                }

                .recent-prescriptions {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                }

                .prescription-summary {
                    padding: 15px;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    margin-bottom: 10px;
                }

                .prescription-date {
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 5px;
                }

                .prescription-diagnosis {
                    color: #666;
                }

                .bill-display {
                    background: white;
                    border-radius: 10px;
                }

                .bill-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #667eea;
                }

                .clinic-info h3 {
                    color: #667eea;
                    margin-bottom: 10px;
                }

                .clinic-info p {
                    margin: 5px 0;
                    color: #666;
                }

                .bill-info {
                    text-align: right;
                }

                .bill-info h4 {
                    color: #667eea;
                    margin-bottom: 10px;
                    font-size: 1.5rem;
                }

                .patient-info-bill {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }

                .patient-info-bill h4 {
                    margin-bottom: 15px;
                    color: #333;
                }

                .bill-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                    overflow: hidden;
                }

                .bill-table th {
                    background: #667eea;
                    color: white;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }

                .bill-table td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .bill-table tbody tr:hover {
                    background: #f8f9fa;
                }

                .total-row {
                    background: #f0f8ff !important;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .total-row td {
                    border-bottom: none;
                    color: #667eea;
                }

                .bill-footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #666;
                }

                .bill-actions {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 30px;
                }

                .btn-secondary {
                    background: #6c757d;
                    color: white;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .btn-secondary:hover {
                    background: #5a6268;
                    transform: translateY(-2px);
                }

                .no-patients,
                .no-tokens,
                .no-bills {
                    text-align: center;
                    padding: 40px 20px;
                    color: #666;
                }

                .no-patients i,
                .no-tokens i,
                .no-bills i {
                    font-size: 4rem;
                    color: #ccc;
                    margin-bottom: 20px;
                }

                .no-patients h3 {
                    margin-bottom: 10px;
                    color: #333;
                }

                .patient-search-item {
                    background: white;
                    padding: 15px;
                    border-radius: 10px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border: 1px solid #e0e0e0;
                }

                .patient-search-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    border-color: #667eea;
                }

                .patient-search-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .patient-search-header strong {
                    color: #333;
                    font-size: 1.1rem;
                }

                .patient-phone {
                    color: #667eea;
                    font-weight: 500;
                }

                .patient-search-details {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: #666;
                    font-size: 0.9rem;
                }

                .patient-status {
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .patient-status.waiting {
                    background: #fff3cd;
                    color: #856404;
                }

                .patient-status.consulted {
                    background: #d1ecf1;
                    color: #0c5460;
                }

                .patient-status.billed {
                    background: #d4edda;
                    color: #155724;
                }

                .prescription-field {
                    margin-bottom: 15px;
                }

                .prescription-field strong {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                }

                .prescription-field p {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 5px;
                    margin: 0;
                    line-height: 1.5;
                }

                .prescription-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .prescription-time {
                    color: #666;
                    font-size: 0.9rem;
                }

                .history-item {
                    background: white;
                    padding: 25px;
                    border-radius: 15px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    margin-bottom: 20px;
                }

                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e0e0e0;
                }

                .prescriptions-history h4 {
                    color: #667eea;
                    margin-bottom: 20px;
                }

                .prescription-item {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 15px;
                    border-left: 4px solid #667eea;
                }

                @media (max-width: 768px) {
                    .modal-content {
                        width: 95%;
                        margin: 10% auto;
                    }

                    .modal-body {
                        padding: 20px;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .bill-header {
                        flex-direction: column;
                        gap: 20px;
                    }

                    .bill-info {
                        text-align: left;
                    }

                    .bill-actions {
                        flex-direction: column;
                    }

                    .patient-search-header,
                    .patient-search-details {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 5px;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', modalStyles);
    }

    // Tab switching functions
    switchTab(tabType) {
        if (tabType === 'doctor') {
            document.getElementById('doctorLogin').classList.add('active');
            document.getElementById('receptionistLogin').classList.remove('active');
        } else {
            document.getElementById('receptionistLogin').classList.add('active');
            document.getElementById('doctorLogin').classList.remove('active');
        }

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show requested section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const navLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
        if (navLink) {
            navLink.classList.add('active');
        }
    }

    showRegister(role) {
        this.showSection('register');
        if (role) {
            document.getElementById('regRole').value = role;
            const event = new Event('change');
            document.getElementById('regRole').dispatchEvent(event);
        }
    }

    showDoctorTab(tabName) {
        if (window.doctorModule) {
            window.doctorModule.showDoctorTab(tabName);
        }
    }

    showReceptionistTab(tabName) {
        if (window.receptionistModule) {
            window.receptionistModule.showReceptionistTab(tabName);
        }
    }

    async logout() {
        if (window.authModule) {
            await window.authModule.logout();
        }
    }

    searchPatientHistory() {
        if (window.doctorModule) {
            window.doctorModule.searchPatientHistory();
        }
    }

    searchPatients() {
        if (window.receptionistModule) {
            window.receptionistModule.searchPatients();
        }
    }

    // Utility functions
    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading"></div>';
        }
    }

    hideLoading() {
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => el.remove());
    }

    formatDate(date) {
        if (!date) return 'N/A';
        if (date.toDate) {
            return date.toDate().toLocaleDateString();
        }
        return new Date(date).toLocaleDateString();
    }

    formatTime(date) {
        if (!date) return 'N/A';
        if (date.toDate) {
            return date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        if (window.authModule) {
            window.authModule.showMessage(`An error occurred${context ? ' in ' + context : ''}. Please try again.`, 'error');
        }
    }

    // Data validation
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>\"']/g, '');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ClinicManagementApp();
});

// Make app available globally for debugging
window.app = ClinicManagementApp;
