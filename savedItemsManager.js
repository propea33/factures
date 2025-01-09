class SavedItemsManager {
    constructor() {
        this.storageKey = 'savedItems';
        this.itemListContainer = document.createElement('div');
        this.itemListContainer.className = 'saved-items-list saved-clients-list';
        this.setupItemsList();
    }

    setupItemsList() {
        const itemsSection = document.querySelector('#itemsContainer');
        itemsSection.parentNode.insertBefore(this.itemListContainer, itemsSection);
        this.renderItemsList();
    }

    saveItem(itemData) {
        const items = this.getSavedItems();
        const itemId = itemData.description;
        
        const existingIndex = items.findIndex(item => item.description === itemId);
        
        if (existingIndex !== -1) {
            items[existingIndex] = itemData;
        } else {
            items.push(itemData);
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(items));
        this.renderItemsList();
    }

    getSavedItems() {
        const items = localStorage.getItem(this.storageKey);
        return items ? JSON.parse(items) : [];
    }

    deleteItem(description) {
        const items = this.getSavedItems();
        const updatedItems = items.filter(item => item.description !== description);
        localStorage.setItem(this.storageKey, JSON.stringify(updatedItems));
        this.renderItemsList();
    }

    renderItemsList() {
        this.itemListContainer.innerHTML = '';  // Vider le conteneur avant de le remplir
        const items = this.getSavedItems();
        const itemsHtml = items.map(item => `
            <div class="saved-client-item">
                <span class="client-name">${item.description} - ${item.rate}$</span>
                <span class="delete-client">×</span>
            </div>
        `).join('');
        this.itemListContainer.innerHTML = itemsHtml;
        this.setupItemEvents();
    }

    setupItemEvents() {
        const itemElements = this.itemListContainer.querySelectorAll('.saved-client-item');
        
        itemElements.forEach(item => {
            const descriptionText = item.querySelector('.client-name').textContent;
            const description = descriptionText.split(' - ')[0];
            const deleteBtn = item.querySelector('.delete-client');

            item.querySelector('.client-name').addEventListener('click', () => {
                const savedItem = this.getSavedItems().find(i => i.description === description);
                if (savedItem) {
                    const itemManager = new ItemManager();
                    itemManager.addNewRowWithData(savedItem);
                }
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Êtes-vous sûr de vouloir supprimer l'item "${description}" ?`)) {
                    this.deleteItem(description);
                }
            });
        });
    }
}
