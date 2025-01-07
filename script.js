// script.js - Main application logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    const itemManager = new ItemManager();
    const form = document.getElementById('invoiceForm');

    // Set default date to today
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    // Generate default invoice number (INVyyyyMMddxxx)
    const today = new Date();
    const defaultInvoiceNumber = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}001`;
    document.getElementById('invoiceNumber').value = defaultInvoiceNumber;

    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            // Business Information
            businessName: document.getElementById('businessName').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessAddress: document.getElementById('businessAddress').value,
            businessPhone: document.getElementById('businessPhone').value,
            gstNumber: document.getElementById('gstNumber').value,

            // Client Information
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientAddress: document.getElementById('clientAddress').value,
            clientPhone: document.getElementById('clientPhone').value,
            clientMobile: document.getElementById('clientMobile').value,
            clientFax: document.getElementById('clientFax').value,

            // Invoice Details
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            terms: document.getElementById('terms').value
        };

        // Get items from ItemManager
        const items = itemManager.getItems();

        // Calculate subtotal
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

        // Calculate taxes using TaxCalculator
        const taxes = TaxCalculator.calculateTaxes(subtotal);

        try {
            // Generate PDF using PDFGenerator
            await PDFGenerator.generatePDF(formData, items, taxes);
            
            // Optional: Show success message
            alert('Facture générée avec succès!');
        } catch (error) {
            console.error('Erreur lors de la génération de la facture:', error);
            alert('Une erreur est survenue lors de la génération de la facture.');
        }
    });

    // Add form validation
    function validatePhoneNumber(phone) {
        const phoneRegex = /^[\d\s\-()]+$/;
        return phoneRegex.test(phone);
    }
document.getElementById('previewInvoice').addEventListener('click', function() {
    const formData = {
        businessName: document.getElementById('businessName').value || 'N/A',
        businessEmail: document.getElementById('businessEmail').value || 'N/A',
        businessAddress: document.getElementById('businessAddress').value || 'N/A',
        businessPhone: document.getElementById('businessPhone').value || 'N/A',
        gstNumber: document.getElementById('gstNumber').value || 'N/A',
        qstNumber: document.getElementById('qstNumber').value || 'N/A',
        clientName: document.getElementById('clientName').value || 'N/A',
        clientEmail: document.getElementById('clientEmail').value || 'N/A',
        clientAddress: document.getElementById('clientAddress').value || 'N/A',
        clientPhone: document.getElementById('clientPhone').value || 'N/A',
        clientMobile: document.getElementById('clientMobile').value || 'N/A',
        clientFax: document.getElementById('clientFax').value || 'N/A',
        invoiceNumber: document.getElementById('invoiceNumber').value || 'N/A',
        invoiceDate: document.getElementById('invoiceDate').value || new Date().toISOString().split('T')[0],
        terms: document.getElementById('terms').value || 'Sur réception'
    };

    const items = itemManager.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxes = TaxCalculator.calculateTaxes(subtotal);

    PDFGenerator.showPreview(formData, items, taxes);
});
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Add input validation listeners
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value && !validatePhoneNumber(this.value)) {
                this.setCustomValidity('Veuillez entrer un numéro de téléphone valide');
            } else {
                this.setCustomValidity('');
            }
        });
    });

    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value && !validateEmail(this.value)) {
                this.setCustomValidity('Veuillez entrer une adresse courriel valide');
            } else {
                this.setCustomValidity('');
            }
        });
    });

    // Format phone numbers as they are entered
    function formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return '(' + match[1] + ') ' + match[2] + '-' + match[3];
        }
        return phone;
    }

    phoneInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.length >= 10) {
                this.value = formatPhoneNumber(this.value);
            }
        });
    });
});
