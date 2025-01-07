class PDFGenerator {
    static async generatePDF(formData, items, taxes) {
        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        
        // Ajouter des styles spécifiques pour l'impression
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
            // Attendre que jsPDF soit complètement chargé
            const { jsPDF } = window.jspdf;
            
            // Capture la page en image
            const canvas = await html2canvas(preview, {
                scale: 2, // Meilleure qualité
                useCORS: true,
                logging: false
            });
            
            // Créer le PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Calculer les dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;

            // Ajouter l'image au PDF
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

            // Sauvegarder le PDF
            pdf.save(`facture-${formData.invoiceNumber}.pdf`);
            
            // Cacher la prévisualisation
            preview.style.display = 'none';
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
            preview.style.display = 'none';
            return false;
        }
    }

    static generateHTML(formData, items, taxes) {
        return `
            <div class="invoice-preview">
                <table style="width: 100%; margin-bottom: 30px; border: none;">
                    <tr>
                        <td style="border: none; width: 50%; vertical-align: top;">
                            <h2 style="margin: 0; color: #333;">${formData.businessName}</h2>
                            <p style="margin: 5px 0;">${formData.businessAddress}</p>
                            <p style="margin: 5px 0;">Tél: ${formData.businessPhone}</p>
                            <p style="margin: 5px 0;">Courriel: ${formData.businessEmail}</p>
                            <p style="margin: 5px 0;">TPS #: ${formData.gstNumber}</p>
                        </td>
                        <td style="border: none; width: 50%; text-align: right; vertical-align: top;">
                            <h1 style="margin: 0; color: #2c3e50;">FACTURE</h1>
                            <p style="margin: 5px 0;">Numéro: ${formData.invoiceNumber}</p>
                            <p style="margin: 5px 0;">Date: ${new Date(formData.invoiceDate).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;">Conditions: ${formData.terms}</p>
                        </td>
                    </tr>
                </table>

                <div style="margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0;">Facturer à:</h3>
                    <p style="margin: 5px 0;">${formData.clientName}</p>
                    <p style="margin: 5px 0;">${formData.clientAddress}</p>
                    <p style="margin: 5px 0;">Tél: ${formData.clientPhone}</p>
                    ${formData.clientMobile ? `<p style="margin: 5px 0;">Mobile: ${formData.clientMobile}</p>` : ''}
                    ${formData.clientFax ? `<p style="margin: 5px 0;">Fax: ${formData.clientFax}</p>` : ''}
                    <p style="margin: 5px 0;">Courriel: ${formData.clientEmail}</p>
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
                                <td style="text-align: right;">${item.rate.toFixed(2)} $</td>
                                <td style="text-align: right;">${item.quantity}</td>
                                <td style="text-align: right;">${item.amount.toFixed(2)} $</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-section" style="text-align: right;">
                    <table style="width: 300px; margin-left: auto;">
                        <tr>
                            <td style="text-align: left;">Sous-total:</td>
                            <td style="text-align: right;">${taxes.subtotal.toFixed(2)} $</td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">TPS (5%):</td>
                            <td style="text-align: right;">${taxes.tps.toFixed(2)} $</td>
                        </tr>
                        <tr>
                            <td style="text-align: left;">TVQ (9.975%):</td>
                            <td style="text-align: right;">${taxes.tvq.toFixed(2)} $</td>
                        </tr>
                        <tr>
                            <td style="text-align: left; font-weight: bold;">Total:</td>
                            <td style="text-align: right; font-weight: bold;">${taxes.total.toFixed(2)} $</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }
}
