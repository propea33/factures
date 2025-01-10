class EmailHandler {
    static async sendInvoiceEmail(formData, pdfBlob) {
        // Préparer le sujet de l'email
        const subject = `Facture ${formData.invoiceNumber}`;
        
        // Préparer le corps du message
        const body = `
Bonjour ${formData.clientName},

J'espère que vous allez bien. Veuillez trouver ci-joint la facture ${formData.invoiceNumber} datée du ${new Date(formData.invoiceDate).toLocaleDateString('fr-CA')}.

Total de la facture : ${formData.currency === 'EUR' ? '€' : '$'}${formData.total}

Si vous avez des questions concernant cette facture, n'hésitez pas à me contacter.

Cordialement,
${formData.businessName}
${formData.businessPhone}
`;

        // Encoder le corps du message pour l'URL
        const encodedBody = encodeURIComponent(body);
        const encodedSubject = encodeURIComponent(subject);
        const mailtoLink = `mailto:${formData.clientEmail}?subject=${encodedSubject}&body=${encodedBody}`;
        
        // Ouvrir le client de messagerie par défaut
        window.location.href = mailtoLink;
    }
}
