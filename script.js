const factureForm = document.getElementById('factureForm');
const pdfViewer = document.getElementById('pdfViewer');

function genererPDF() {
  // Récupérer les données du formulaire
  const formData = new FormData(factureForm);
  // ... Traitement des données (calculs, validation) ...

  // Créer un nouveau document PDF
  const doc = new jsPDF();

  // Récupérer le contenu du modèle HTML
  fetch('pdfTemplate.html')
    .then(response => response.text())
    .then(template => {
      // Remplacer les éléments dynamiques dans le template
      const html = template
        .replace('{{factureNumber}}', formData.get('factureNumber'));
      // ... Autres remplacements ...

      // Ajouter le contenu HTML au PDF
      doc.html(html, {
        callback: function(doc) {
          doc.save('facture.pdf');
          pdfViewer.src = URL.createObjectURL(doc.output('blob'));
        }
      });
    });
}
