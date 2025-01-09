class InvoiceHistory {
    constructor() {
        this.storageKey = 'invoiceHistory';
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.setupHistoryModal();
    }

    setupHistoryModal() {
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

        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = () => {
                const invoiceNumber = btn.dataset.invoice;
                this.deleteInvoice(invoiceNumber);
            };
        });
    }
}
