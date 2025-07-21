// Billing Module
class BillingModule {
    constructor() {
        this.services = [
            { name: 'Blood Test', price: 100 },
            { name: 'X-Ray', price: 200 },
            { name: 'ECG', price: 150 },
            { name: 'Medicines', price: 50 }
        ];
        this.init();
    }

    init() {
        this.setupFormListeners();
        this.setupServiceCalculation();
    }

    setupFormListeners() {
        // Billing form
        document.getElementById('billingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateBill();
        });
    }

    setupServiceCalculation() {
        // Listen for changes in consultation fee and services
        const consultationFeeInput = document.getElementById('consultationFee');
        const serviceCheckboxes = document.querySelectorAll('.service-check');

        if (consultationFeeInput) {
            consultationFeeInput.addEventListener('input', () => {
                this.calculateTotal();
            });
        }

        serviceCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculateTotal();
            });
        });
    }

    calculateTotal() {
        const consultationFee = parseFloat(document.getElementById('consultationFee').value) || 0;
        const serviceCheckboxes = document.querySelectorAll('.service-check:checked');
        
        let servicesTotal = 0;
        serviceCheckboxes.forEach(checkbox => {
            servicesTotal += parseFloat(checkbox.value) || 0;
        });

        const total = consultationFee + servicesTotal;
        document.getElementById('totalAmount').textContent = total;
    }

    async generateBill() {
        const patientId = document.getElementById('billingPatient').value;
        const consultationFee = parseFloat(document.getElementById('consultationFee').value) || 0;
        const serviceCheckboxes = document.querySelectorAll('.service-check:checked');

        if (!patientId) {
            authModule.showMessage('Please select a patient', 'error');
            return;
        }

        try {
            // Get patient details
            const patientDoc = await db.collection('patients').doc(patientId).get();
            if (!patientDoc.exists) {
                authModule.showMessage('Patient not found', 'error');
                return;
            }

            const patient = patientDoc.data();

            // Calculate services
            const selectedServices = [];
            let servicesTotal = 0;

            serviceCheckboxes.forEach(checkbox => {
                const serviceName = checkbox.parentElement.textContent.split(' - ')[0];
                const servicePrice = parseFloat(checkbox.value);
                selectedServices.push({
                    name: serviceName,
                    price: servicePrice
                });
                servicesTotal += servicePrice;
            });

            const totalAmount = consultationFee + servicesTotal;

            // Generate bill number
            const billNumber = await this.generateBillNumber();

            // Create bill data
            const billData = {
                billNumber: billNumber,
                patientId: patientId,
                patientName: patient.name,
                patientPhone: patient.phone,
                consultationFee: consultationFee,
                services: selectedServices,
                servicesTotal: servicesTotal,
                totalAmount: totalAmount,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: auth.currentUser.uid,
                status: 'unpaid'
            };

            // Save bill to database
            const billRef = await db.collection('bills').add(billData);

            // Update patient status to billed
            await db.collection('patients').doc(patientId).update({
                status: 'billed',
                billedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastBillId: billRef.id
            });

            // Generate and display bill
            this.displayBill(billData);

            // Clear form
            document.getElementById('billingForm').reset();
            document.getElementById('totalAmount').textContent = '500';

            authModule.showMessage('Bill generated successfully!', 'success');

            // Refresh billing data
            window.receptionistModule.loadPatientsForBilling();
            window.receptionistModule.loadRecentBills();

        } catch (error) {
            console.error('Error generating bill:', error);
            authModule.showMessage('Error generating bill. Please try again.', 'error');
        }
    }

    async generateBillNumber() {
        try {
            // Get today's date for bill numbering
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
            
            // Get existing bills for today
            const billsSnapshot = await db.collection('bills')
                .orderBy('createdAt', 'desc')
                .limit(1)
                .get();
            
            let sequenceNumber = 1;
            if (!billsSnapshot.empty) {
                const lastBill = billsSnapshot.docs[0].data();
                const lastBillNumber = lastBill.billNumber;
                const lastSequence = parseInt(lastBillNumber.split('-')[1]) || 0;
                sequenceNumber = lastSequence + 1;
            }
            
            return `${dateStr}-${sequenceNumber.toString().padStart(4, '0')}`;
            
        } catch (error) {
            console.error('Error generating bill number:', error);
            // Fallback to timestamp-based number
            return `BILL-${Date.now()}`;
        }
    }

    displayBill(billData) {
        // Create or update bill display modal
        let billModal = document.getElementById('billModal');
        if (!billModal) {
            billModal = document.createElement('div');
            billModal.id = 'billModal';
            billModal.className = 'modal';
            document.body.appendChild(billModal);
        }

        const billDate = new Date().toLocaleDateString();
        const billTime = new Date().toLocaleTimeString();

        billModal.innerHTML = `
            <div class="modal-content bill-modal-content">
                <div class="modal-header">
                    <h2>Bill Generated</h2>
                    <span class="close" onclick="billingModule.closeBillModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="bill-display">
                        <div class="bill-header">
                            <div class="clinic-info">
                                <h3>HealthCare Clinic</h3>
                                <p>123 Healthcare Street, Medical City</p>
                                <p>Phone: +1 (555) 123-4567</p>
                            </div>
                            <div class="bill-info">
                                <h4>BILL</h4>
                                <p><strong>Bill No:</strong> ${billData.billNumber}</p>
                                <p><strong>Date:</strong> ${billDate}</p>
                                <p><strong>Time:</strong> ${billTime}</p>
                            </div>
                        </div>
                        
                        <div class="patient-info-bill">
                            <h4>Patient Information</h4>
                            <p><strong>Name:</strong> ${billData.patientName}</p>
                            <p><strong>Phone:</strong> ${billData.patientPhone}</p>
                        </div>
                        
                        <div class="bill-items">
                            <table class="bill-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Consultation Fee</td>
                                        <td>₹${billData.consultationFee}</td>
                                    </tr>
                                    ${billData.services.map(service => `
                                        <tr>
                                            <td>${service.name}</td>
                                            <td>₹${service.price}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr class="total-row">
                                        <td><strong>Total Amount</strong></td>
                                        <td><strong>₹${billData.totalAmount}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        
                        <div class="bill-footer">
                            <p>Thank you for visiting HealthCare Clinic!</p>
                            <p>Please retain this bill for your records.</p>
                        </div>
                        
                        <div class="bill-actions">
                            <button onclick="billingModule.printBill()" class="btn-primary">
                                <i class="fas fa-print"></i> Print Bill
                            </button>
                            <button onclick="billingModule.downloadBill('${billData.billNumber}')" class="btn-secondary">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        billModal.style.display = 'block';
    }

    printBill() {
        // Create a print-friendly version
        const billContent = document.querySelector('.bill-display').cloneNode(true);
        
        // Remove action buttons from print version
        const actions = billContent.querySelector('.bill-actions');
        if (actions) {
            actions.remove();
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - ${billContent.querySelector('.bill-info p').textContent}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .bill-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .clinic-info h3 { margin: 0; color: #333; }
                    .bill-info { text-align: right; }
                    .patient-info-bill { margin: 20px 0; padding: 15px; background: #f9f9f9; }
                    .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .bill-table th { background: #f5f5f5; }
                    .total-row { background: #f0f0f0; font-weight: bold; }
                    .bill-footer { margin-top: 30px; text-align: center; color: #666; }
                    @media print { 
                        body { margin: 0; } 
                        .bill-actions { display: none; }
                    }
                </style>
            </head>
            <body>
                ${billContent.outerHTML}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }

    downloadBill(billNumber) {
        // In a real application, you would generate a PDF
        // For now, we'll create a downloadable HTML file
        const billContent = document.querySelector('.bill-display').cloneNode(true);
        
        // Remove action buttons
        const actions = billContent.querySelector('.bill-actions');
        if (actions) {
            actions.remove();
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill - ${billNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .bill-header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    .clinic-info h3 { margin: 0; color: #333; }
                    .bill-info { text-align: right; }
                    .patient-info-bill { margin: 20px 0; padding: 15px; background: #f9f9f9; }
                    .bill-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .bill-table th { background: #f5f5f5; }
                    .total-row { background: #f0f0f0; font-weight: bold; }
                    .bill-footer { margin-top: 30px; text-align: center; color: #666; }
                </style>
            </head>
            <body>
                ${billContent.outerHTML}
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bill-${billNumber}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        authModule.showMessage('Bill downloaded successfully!', 'success');
    }

    closeBillModal() {
        const billModal = document.getElementById('billModal');
        if (billModal) {
            billModal.style.display = 'none';
        }
    }

    async loadBillHistory() {
        try {
            const billsSnapshot = await db.collection('bills')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();

            const bills = billsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.displayBillHistory(bills);

        } catch (error) {
            console.error('Error loading bill history:', error);
        }
    }

    displayBillHistory(bills) {
        // This would be implemented if there's a bill history section
        console.log('Bill history:', bills);
    }
}

// Initialize billing module when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const billingModule = new BillingModule();
        window.billingModule = billingModule;
    });
} else {
    // DOM already loaded
    const billingModule = new BillingModule();
    window.billingModule = billingModule;
}
