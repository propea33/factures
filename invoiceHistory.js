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
                                    <th>Date</th>
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
        if (confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoiceNumber} ?`)) {
            const invoices = this.getInvoices();
            const filteredInvoices = invoices.filter(invoice => 
                invoice.formData.invoiceNumber !== invoiceNumber
            );
            localStorage.setItem(this.storageKey, JSON.stringify(filteredInvoices));
            this.showHistory(); // Rafraîchir l'affichage
        }
    }

    showHistory() {
        const modal = document.querySelector('.history-modal');
        const tbody = modal.querySelector('tbody');
        const invoices = this.getInvoices();
        
        tbody.innerHTML = '';
        
        invoices.forEach(invoice => {
            const date = new Date(invoice.timestamp);
            const formattedDate = date.toLocaleDateString('fr-CA');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.formData.invoiceNumber}</td>
                <td>${formattedDate}</td>
                <td>${invoice.taxes.total.toFixed(2)} ${invoice.formData.currency === 'EUR' ? '€' : '$'}</td>
                <td class="action-buttons">
                    <button class="preview-btn">Aperçu</button>
                    <button class="download-btn">Download</button>
                    <button class="delete-btn" data-invoice="${invoice.formData.invoiceNumber}">×</button>
                </td>
            `;

            const previewBtn = row.querySelector('.preview-btn');
            const downloadBtn = row.querySelector('.download-btn');
            const deleteBtn = row.querySelector('.delete-btn');

            previewBtn.onclick = () => {
                PDFGenerator.showPreview(invoice.formData, invoice.items, invoice.taxes);
                modal.style.display = 'none';
            };

            downloadBtn.onclick = () => {
                PDFGenerator.generatePDF(invoice.formData, invoice.items, invoice.taxes);
            };

            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                const invoiceNumber = e.target.getAttribute('data-invoice');
                this.deleteInvoice(invoiceNumber);
            };

            tbody.appendChild(row);
        });
        
        modal.style.display = 'block';
    }
}
