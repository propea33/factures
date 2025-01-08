document.addEventListener('DOMContentLoaded', function() {
    window.invoiceHistory = new InvoiceHistory();
    const itemManager = new ItemManager();
    const clientStorage = new ClientStorage();
    const savedItemsManager = new SavedItemsManager();
    const form = document.getElementById('invoiceForm');

    // Set default date to today
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    // Get last invoice number from localStorage
    const getLastInvoiceNumber = () => {
        const invoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
        if (invoices.length === 0) {
            const today = new Date();
            return `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}001`;
        }
        
        const lastInvoice = invoices[invoices.length - 1];
        const lastNumber = parseInt(lastInvoice.formData.invoiceNumber.slice(-3));
        const today = new Date();
        return `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}${String(lastNumber + 1).padStart(3, '0')}`;
    };

    document.getElementById('invoiceNumber').value = getLastInvoiceNumber();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            businessName: document.getElementById('businessName').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessAddress: document.getElementById('businessAddress').value,
            businessPhone: document.getElementById('businessPhone').value,
            gstNumber: document.getElementById('gstNumber').value,
            qstNumber: document.getElementById('qstNumber').value,
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientAddress: document.getElementById('clientAddress').value,
            clientPhone: document.getElementById('clientPhone').value,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value
        };

        if (formData.clientName.trim() !== '') {
            const clientData = {
                clientName: formData.clientName,
                clientEmail: form.clientEmail,
                clientAddress: formData.clientAddress,
                clientPhone: formData.clientPhone,
                businessName: formData.businessName,
                businessEmail: formData.businessEmail,
                businessAddress: formData.businessAddress,
                businessPhone: formData.businessPhone,
                gstNumber: formData.gstNumber,
                qstNumber: formData.qstNumber
            };
            clientStorage.saveClient(clientData);
        }

        const items = itemManager.getItems();
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxes = TaxCalculator.calculateTaxes(subtotal);

        try {
            await PDFGenerator.generatePDF(formData, items, taxes);
            document.getElementById('invoiceNumber').value = getLastInvoiceNumber();
        } catch (error) {
            console.error('Erreur lors de la génération de la facture:', error);
        }
    });

    // Preview handler
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
            invoiceNumber: document.getElementById('invoiceNumber').value || 'N/A',
            invoiceDate: document.getElementById('invoiceDate').value
        };

        const items = itemManager.getItems();
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxes = TaxCalculator.calculateTaxes(subtotal);

        PDFGenerator.showPreview(formData, items, taxes);
    });
});


