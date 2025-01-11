document.addEventListener('DOMContentLoaded', function() {
    window.invoiceHistory = new InvoiceHistory();
    const itemManager = new ItemManager();
    const clientStorage = new ClientStorage();
    const form = document.getElementById('invoiceForm');

    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Vérifier si un thème est déjà sauvegardé
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
    
    darkModeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    });
 
    // Set default date to today
    document.getElementById('invoiceDate').valueAsDate = new Date();
    
    // Get last invoice number from localStorage
    const getLastInvoiceNumber = () => {
        const today = new Date();
        const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
        const invoices = JSON.parse(localStorage.getItem('invoiceHistory') || '[]');
        
        // Filtrer les factures pour ne garder que celles d'aujourd'hui
        const todayInvoices = invoices.filter(invoice => 
            invoice.formData.invoiceNumber.includes(`INV${datePrefix}`)
        );

        if (todayInvoices.length === 0) {
            return `INV${datePrefix}001`;
        }
        
        // Trouver le plus grand numéro de séquence pour aujourd'hui
        const sequences = todayInvoices.map(invoice => 
            parseInt(invoice.formData.invoiceNumber.slice(-3))
        );
        const maxSequence = Math.max(...sequences);
        
        return `INV${datePrefix}${String(maxSequence + 1).padStart(3, '0')}`;
    };

    document.getElementById('invoiceNumber').value = getLastInvoiceNumber();

    // Ajouter l'event listener pour le bouton historique
    document.getElementById('historyButton').addEventListener('click', function() {
        if (window.invoiceHistory) {
            window.invoiceHistory.showHistory();
        }
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const noTax = document.getElementById('noTax').checked;
        const currency = document.getElementById('currencySelect').value;

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
            clientAdditionalInfo: document.getElementById('clientAdditionalInfo').value,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            currency: currency,
            noTax: noTax
        };

        if (formData.clientName.trim() !== '') {
            clientStorage.saveClient(formData);
        }

        const items = itemManager.getItems();
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        
        let taxes;
        if (noTax) {
            taxes = {
                subtotal: subtotal,
                tps: 0,
                tvq: 0,
                total: subtotal
            };
        } else {
            taxes = TaxCalculator.calculateTaxes(subtotal);
        }

        try {
            const success = await PDFGenerator.generatePDF(formData, items, taxes);
            if (success) {
                itemManager.saveItems();
                document.getElementById('invoiceNumber').value = getLastInvoiceNumber();
            }
        } catch (error) {
            console.error('Erreur lors de la génération de la facture:', error);
        }
    });

    // Preview handler
  document.getElementById('previewInvoice').addEventListener('click', function() {
    const noTax = document.getElementById('noTax').checked;
    const currency = document.getElementById('currencySelect').value;

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
        clientAdditionalInfo: document.getElementById('clientAdditionalInfo').value || '', // Ajout du champ
        invoiceNumber: document.getElementById('invoiceNumber').value || 'N/A',
        invoiceDate: document.getElementById('invoiceDate').value,
        currency: currency,
        noTax: noTax
    };

    const items = itemManager.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    let taxes;
    if (noTax) {
        taxes = {
            subtotal: subtotal,
            tps: 0,
            tvq: 0,
            total: subtotal
        };
    } else {
        taxes = TaxCalculator.calculateTaxes(subtotal);
    }

    PDFGenerator.showPreview(formData, items, taxes);
});

    // Configuration du menu latéral
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    const mainContent = document.querySelector('.main-content');
    const overlay = document.querySelector('.sidebar-overlay');
    
    toggleButton.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('sidebar-open');
        overlay.classList.toggle('active');
    });

   
   // Fermer le menu si on clique sur l'overlay
    overlay.addEventListener('click', function() {
    sidebar.classList.remove('open');
    mainContent.classList.remove('sidebar-open');
    overlay.classList.remove('active');
});

    // Event listener pour le bouton d'envoi par email
    document.getElementById('emailInvoice').addEventListener('click', function() {
        // Vérifier si l'email du client est présent
        const clientEmail = document.getElementById('clientEmail').value;
        if (!clientEmail) {
            alert('Veuillez entrer l\'adresse email du client avant d\'envoyer la facture.');
            return;
        }

        const noTax = document.getElementById('noTax').checked;
        const currency = document.getElementById('currencySelect').value;

        // Collecter les données du formulaire
        const formData = {
            businessName: document.getElementById('businessName').value || 'N/A',
            businessEmail: document.getElementById('businessEmail').value || 'N/A',
            businessAddress: document.getElementById('businessAddress').value || 'N/A',
            businessPhone: document.getElementById('businessPhone').value || 'N/A',
            clientName: document.getElementById('clientName').value || 'N/A',
            clientEmail: clientEmail,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            currency: currency
        };

        // Calculer le total
        const items = itemManager.getItems();
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxes = noTax ? 
            { subtotal, tps: 0, tvq: 0, total: subtotal } : 
            TaxCalculator.calculateTaxes(subtotal);
        
        formData.total = taxes.total.toFixed(2);

        // Envoyer l'email
        EmailHandler.sendInvoiceEmail(formData);
    });
});
