class PDFGenerator {
    static async generatePDF(formData, items, taxes) {
        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        
        preview.innerHTML = `
            <style>
                .invoice-preview {
                    background: white;
                    padding: 30px;
                    font-family: Arial, sans-serif;
                }
                .invoice-preview table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                .invoice-preview th,
                .invoice-preview td {
                    padding: 10px;
                    border: 1px solid #ddd;
                }
                .invoice-preview th {
                    background-color: #f8f9fa;
                }
                .totals-section {
                    margin-top: 20px;
                    border-top: 2px solid #ddd;
                    padding-top: 20px;
                }
            </style>
            ${this.generateHTML(formData, items, taxes)}
        `;
        
        try {
            const { jsPDF } = window.jspdf;
            
            const canvas = await html2canvas(preview, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = canvas.height * imgWidth / canvas.width;

            pdf.addImage(
                canvas.toDataURL('image/jpeg', 1.0),
                'JPEG',
                0,
                0,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            );

            // Sauvegarder dans l'historique
            if (window.invoiceHistory) {
                window.invoiceHistory.saveInvoice(formData, items, taxes);
            }

            pdf.save(`facture-${formData.invoiceNumber}.pdf`);
            
            preview.style.display = 'none';
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            preview.style.display = 'none';
            return false;
        }
    }

    static generateHTML(formData, items, taxes) {
        // Définir le symbole de la devise et le code
        const currencySymbol = formData.currency === 'EUR' ? '€' : '$';
        const currencyCode = formData.currency || 'CAD';

        // Correction pour la date : on ajuste la date pour compenser le décalage horaire
        const formatDate = (dateString) => {
            if (!dateString) return '';
            
            // On crée une date à partir de la chaîne
            const date = new Date(dateString);
            
            // On ajoute un jour pour compenser le décalage
            date.setDate(date.getDate() + 1);
            
            // On formate la date selon le format désiré (YYYY-MM-DD)
            return date.toLocaleDateString('fr-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        };

        return `
            <div class="invoice-preview">
                <table style="width: 100%; margin-bottom: 30px; border: none;">
                    <tr>
                        <td style="border: none; width: 50%; vertical-align: top;">
                            <h2 style="margin: 0; color: #333;">${formData.businessName || ''}</h2>
                            <p style="margin: 5px 0;">${formData.businessAddress || ''}</p>
                            <p style="margin: 5px 0;">Tél: ${formData.businessPhone || ''}</p>
                            <p style="margin: 5px 0;">Courriel: ${formData.businessEmail || ''}</p>
                            <p style="margin: 5px 0;">GST #: ${formData.gstNumber || 'N/A'}</p>
                            <p style="margin: 5px 0;">QST #: ${formData.qstNumber || 'N/A'}</p>
                        </td>
                        <td style="border: none; width: 50%; text-align: right; vertical-align: top;">
                            <h1 style="margin: 0; color: #2c3e50;">FACTURE</h1>
                            <p style="margin: 5px 0;">Numéro: ${formData.invoiceNumber || ''}</p>
                            <p style="margin: 5px 0;">Date: ${formatDate(formData.invoiceDate)}</p>
                        </td>
                    </tr>
                </table>

                <div style="margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0;">Facturer à:</h3>
                    <p style="margin: 5px 0;">${formData.clientName || ''}</p>
                    <p style="margin: 5px 0;">${formData.clientAddress || ''}</p>
                    <p style="margin: 5px 0;">Tél: ${formData.clientPhone || ''}</p>
                    <p style="margin: 5px 0;">Courriel: ${formData.clientEmail || ''}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;">Description</th>
                            <th style="text-align: right;">Taux</th>
                            <th style="text-align: right;">Quantité</th>
                            <th style="text-align: right;">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="text-align: left;">${item.description}</td>
                                <td style="text-align: right;">${item.rate.toFixed(2)} ${currencySymbol}</td>
                                <td style="text-align: right;">${item.quantity}</td>
                                <td style="text-align: right;">${item.amount.toFixed(2)} ${currencySymbol}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-section" style="text-align: right;">
                    <table style="width: 300px; margin-left: auto;">
                        <tr>
                            <td style="text-align: left;">Sous-total:</td>
                            <td style="text-align: right;">${taxes.subtotal.toFixed(2)} ${currencySymbol}</td>
                        </tr>
                        ${!formData.noTax ? `
                            <tr>
                                <td style="text-align: left;">TPS (5%):</td>
                                <td style="text-align: right;">${taxes.tps.toFixed(2)} ${currencySymbol}</td>
                            </tr>
                            <tr>
                                <td style="text-align: left;">TVQ (9.975%):</td>
                                <td style="text-align: right;">${taxes.tvq.toFixed(2)} ${currencySymbol}</td>
                            </tr>
                        ` : ''}
                        <tr>
                            <td style="text-align: left; font-weight: bold;">Total:</td>
                            <td style="text-align: right; font-weight: bold;">${taxes.total.toFixed(2)} ${currencySymbol} ${currencyCode}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }

    static showPreview(formData, items, taxes) {
        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        preview.innerHTML = this.generateHTML(formData, items, taxes);
        preview.scrollIntoView({ behavior: 'smooth' });
    }
}
