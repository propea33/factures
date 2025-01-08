// invoiceHistory.js
class InvoiceHistory {
    constructor() {
        this.storageKey = 'invoiceHistory';
        
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupLayout();
        this.setupHistoryModal();
    }

    setupLayout() {
        // 1. Trouver le container et le titre existant
        const container = document.querySelector('.container');
        const existingTitle = container.querySelector('h1');
        
        // 2. Créer le nouveau header container
        const headerContainer = document.createElement('div');
        headerContainer.style.display = 'flex';
        headerContainer.style.alignItems = 'center';
        headerContainer.style.justifyContent = 'space-between';
        headerContainer.style.width = '100%';
        headerContainer.style.marginBottom = '30px';
        
        // 3. Déplacer le titre existant dans le header container
        if (existingTitle) {
            existingTitle.style.margin = '0';
            existingTitle.style.textAlign = 'left';
            headerContainer.appendChild(existingTitle);
        }
        
        // 4. Créer et ajouter le bouton historique
        const historyButton = document.createElement('button');
        historyButton.textContent = 'Historique';
        historyButton.className = 'history-button';
        historyButton.addEventListener('click', () => this.showHistory());
        headerContainer.appendChild(historyButton);
        
        // 5. Insérer le header container au début du container principal
        container.insertBefore(headerContainer, container.firstChild);
    }

    setupHistoryModal() {
        // Créer le modal s'il n'existe pas déjà
        if (!document.querySelector('.history-modal')) {
            const modal = document.createElement('div');
            modal.className = 'history-modal';
            modal.innerHTML = `
                <div class="history-modal-content">
                    <div class="history-modal-header">
                        <h2>Historique des factures</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="history-table-container">
                        <table class="history-table">
                            <thead>
                                <tr>
                                    <th>Numéro de facture</th>
                                    <th>Montant</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Gestionnaire pour fermer le modal
            modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
    }

    saveInvoice(formData, items, taxes) {
        const invoices = this.getInvoices();
        const invoice = {
            formData,
            items,
            taxes,
            timestamp: new Date().toISOString()
        };
        
        invoices.push(invoice);
        localStorage.setItem(this.storageKey, JSON.stringify(invoices));
    }

    getInvoices() {
        const invoices = localStorage.getItem(this.storageKey);
        return invoices ? JSON.parse(invoices) : [];
    }

    deleteInvoice(invoiceNumber) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            const invoices = this.getInvoices();
            const updatedInvoices = invoices.filter(
                invoice => invoice.formData.invoiceNumber !== invoiceNumber
            );
            localStorage.setItem(this.storageKey, JSON.stringify(updatedInvoices));
            this.showHistory();
        }
    }

    showHistory() {
        const modal = document.querySelector('.history-modal');
        const tbody = modal.querySelector('tbody');
        const invoices = this.getInvoices();
        
        tbody.innerHTML = invoices.map(invoice => `
            <tr>
                <td>${invoice.formData.invoiceNumber}</td>
                <td>${invoice.taxes.total.toFixed(2)} $</td>
                <td class="action-buttons">
                    <button class="preview-btn" data-invoice="${invoice.formData.invoiceNumber}">
                        Aperçu
                    </button>
                    <button class="download-btn" data-invoice="${invoice.formData.invoiceNumber}">
                        Download
                    </button>
                    <button class="delete-btn" data-invoice="${invoice.formData.invoiceNumber}">
                        ×
                    </button>
                </td>
            </tr>
        `).join('');
        
        this.setupHistoryEvents(tbody);
        modal.style.display = 'block';
    }

    setupHistoryEvents(tbody) {
        // Aperçu
        tbody.querySelectorAll('.preview-btn').forEach(btn => {
            btn.onclick = () => {
                const invoiceNumber = btn.dataset.invoice;
                const invoice = this.getInvoices().find(
                    inv => inv.formData.invoiceNumber === invoiceNumber
                );
                if (invoice) {
                    PDFGenerator.showPreview(invoice.formData, invoice.items, invoice.taxes);
                    document.querySelector('.history-modal').style.display = 'none';
                }
            };
        });

        // Download
        tbody.querySelectorAll('.download-btn').forEach(btn => {
            btn.onclick = () => {
                const invoiceNumber = btn.dataset.invoice;
                const invoice = this.getInvoices().find(
                    inv => inv.formData.invoiceNumber === invoiceNumber
                );
                if (invoice) {
                    PDFGenerator.generatePDF(invoice.formData, invoice.items, invoice.taxes);
                }
            };
        });

        // Delete
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => {
                const invoiceNumber = btn.dataset.invoice;
                this.deleteInvoice(invoiceNumber);
            };
        });
    }
}

// Créer l'instance
window.invoiceHistory = new InvoiceHistory();
