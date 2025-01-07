class ClientStorage {
    constructor() {
        this.storageKey = 'savedClients';
        this.clientListContainer = document.createElement('div');
        this.clientListContainer.id = 'savedClientsList';
        this.clientListContainer.className = 'saved-clients-list';
        this.setupClientList();
    }

    setupClientList() {
        const title = document.querySelector('h1');
        title.parentNode.insertBefore(this.clientListContainer, title.nextSibling);
        this.renderClientList();
    }

    saveClient(clientData) {
        const clients = this.getSavedClients();
        // Utiliser le nom du client comme identifiant unique
        const clientId = clientData.clientName;
        
        // Vérifier si le client existe déjà
        const existingIndex = clients.findIndex(client => client.clientName === clientId);
        
        if (existingIndex !== -1) {
            // Mettre à jour le client existant
            clients[existingIndex] = clientData;
        } else {
            // Ajouter un nouveau client
            clients.push(clientData);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(clients));
        this.renderClientList();
    }

    getSavedClients() {
        const clients = localStorage.getItem(this.storageKey);
        return clients ? JSON.parse(clients) : [];
    }

    deleteClient(clientName) {
        const clients = this.getSavedClients();
        const updatedClients = clients.filter(client => client.clientName !== clientName);
        localStorage.setItem(this.storageKey, JSON.stringify(updatedClients));
        this.renderClientList();
    }

    renderClientList() {
        const clients = this.getSavedClients();
        this.clientListContainer.innerHTML = clients.map(client => `
            <div class="saved-client-item">
                <span class="client-name">${client.clientName}</span>
                <span class="delete-client">×</span>
            </div>
        `).join('');

        // Ajouter les événements pour chaque client
        this.setupClientEvents();
    }

    setupClientEvents() {
        const clientItems = this.clientListContainer.querySelectorAll('.saved-client-item');
        
        clientItems.forEach(item => {
            const clientName = item.querySelector('.client-name').textContent;
            const deleteBtn = item.querySelector('.delete-client');

            // Événement pour charger les données du client
            item.querySelector('.client-name').addEventListener('click', () => {
                const client = this.getSavedClients().find(c => c.clientName === clientName);
                if (client) {
                    this.loadClientData(client);
                }
            });

            // Événement pour supprimer le client
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?`)) {
                    this.deleteClient(clientName);
                }
            });
        });
    }

    loadClientData(clientData) {
        // Remplir tous les champs avec les données du client
        Object.keys(clientData).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = clientData[key];
            }
        });
    }

    getAllClientData() {
        const formData = {
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            clientAddress: document.getElementById('clientAddress').value,
            clientPhone: document.getElementById('clientPhone').value,
            businessName: document.getElementById('businessName').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessAddress: document.getElementById('businessAddress').value,
            businessPhone: document.getElementById('businessPhone').value,
            gstNumber: document.getElementById('gstNumber').value,
            qstNumber: document.getElementById('qstNumber').value
        };
        return formData;
    }
}
