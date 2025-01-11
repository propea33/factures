class ClientStorage {
    constructor() {
        this.storageKey = 'savedClients';
        this.clientListContainer = document.getElementById('savedClientsList');
        if (this.clientListContainer) {
            this.renderClientList();
        }
    }

    saveClient(clientData) {
        const clients = this.getSavedClients();
        const clientId = clientData.clientName;
        
        const existingIndex = clients.findIndex(client => client.clientName === clientId);
        
        if (existingIndex !== -1) {
            clients[existingIndex] = clientData;
        } else {
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
        if (!this.clientListContainer) return;
        
        const clients = this.getSavedClients();
        this.clientListContainer.innerHTML = clients.map(client => `
            <div class="saved-client-item">
                <span class="client-name">${client.clientName}</span>
                <span class="delete-client">×</span>
            </div>
        `).join('');

        this.setupClientEvents();
    }

    setupClientEvents() {
    if (!this.clientListContainer) return;
    
    const clientItems = this.clientListContainer.querySelectorAll('.saved-client-item');
    
    clientItems.forEach(item => {
        const clientName = item.querySelector('.client-name').textContent;
        const deleteBtn = item.querySelector('.delete-client');

        item.querySelector('.client-name').addEventListener('click', () => {
            const client = this.getSavedClients().find(c => c.clientName === clientName);
            if (client) {
                this.loadClientData(client);
                // Fermer le sidebar et l'overlay
                document.getElementById('sidebar').classList.remove('open');
                document.querySelector('.main-content').classList.remove('sidebar-open');
                document.querySelector('.sidebar-overlay').classList.remove('active');
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Êtes-vous sûr de vouloir supprimer le client "${clientName}" ?`)) {
                this.deleteClient(clientName);
            }
        });
    });
}

    loadClientData(clientData) {
        Object.keys(clientData).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = clientData[key];
            }
        });
    }
}
