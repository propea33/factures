class PDFGenerator {
    static async generatePDF(formData, items, taxes) {
        const preview = document.getElementById('preview');
        preview.style.display = 'block';
        preview.innerHTML = this.generateHTML(formData, items, taxes);
        
        try {
            const canvas = await html2canvas(preview);
            const imgData = canvas.toDataURL('image/png');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`facture-${formData.invoiceNumber}.pdf`);
            
            preview.style.display = 'none';
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        }
    }

    static generateHTML(formData, items, taxes) {
        return `
            <div class="invoice-preview" style="padding: 40px; max-width: 800px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                    <div>
                        <h2 style="margin-bottom: 10px;">${formData.businessName}</h2>
                        <p>${formData.businessAddress}</p>
                        <p>Tél: ${formData.businessPhone}</p>
                        <p>Courriel: ${formData.businessEmail}</p>
                        <p>TPS #: ${formData.gstNumber}</p>
                    </div>
                    <div style="text-align: right;">
                        <h1 style="color: #2c3e50; margin-bottom: 10px;">FACTURE</h1>
                        <p>Numéro: ${formData.invoiceNumber}</p>
                        <p>Date: ${new Date(formData.invoiceDate).toLocaleDateString()}</p>
                        <p>Conditions: ${formData.terms}</p>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="margin-bottom: 10px;">Facturer à:</h3>
                    <p>${formData.clientName}</p>
                    <p>${formData.clientAddress}</p>
                    <p>Tél: ${formData.clientPhone}</p>
                    ${formData.clientMobile ? `<p>Mobile: ${formData.clientMobile}</p>` : ''}
                    ${formData.clientFax ? `<p>Fax: ${formData.clientFax}</p>` : ''}
                    <p>Courriel: ${formData.clientEmail}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Description</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Taux</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Quantité</th>
                            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${item.description}</td>
                                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">${item.rate.toFixed(2)} $</td>
                                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">${item.quantity}</td>
                                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6;">${item.amount.toFixed(2)} $</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-left: auto; width: 300px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Sous-total:</span>
                        <span>${taxes.subtotal.toFixed(2)} $</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>TPS (5%):</span>
                        <span>${taxes.tps.toFixed(2)} $</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>TVQ (9.975%):</span>
                        <span>${taxes.tvq.toFixed(2)} $</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #dee2e6;">
                        <span style="font-weight: bold;">Total:</span>
                        <span style="font-weight: bold;">${taxes.total.toFixed(2)} $</span>
                    </div>
                </div>
            </div>
        `;
    }
}
