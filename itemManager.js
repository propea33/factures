class ItemManager {
    constructor() {
        this.container = document.getElementById('itemsContainer');
        this.savedItemsManager = new SavedItemsManager();
        this.addInitialRow();
        this.setupEventListeners();
    }

    addInitialRow() {
        this.addNewRow();
    }

    createItemRow(itemData = null) {
        const row = document.createElement('div');
        row.className = 'item-row';
        
        const descriptionInput = document.createElement('input');
        descriptionInput.type = 'text';
        descriptionInput.className = 'item-description';
        descriptionInput.placeholder = 'Description';
        descriptionInput.required = true;
        
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'item-details';
        
        detailsContainer.innerHTML = `
            <input type="number" class="item-rate" placeholder="Taux" step="0.01" min="0" required>
            <input type="number" class="item-quantity" placeholder="Quantité" min="1" value="1" required>
            <input type="number" class="item-amount" placeholder="Montant" readonly>
            <button type="button" class="remove-item">×</button>
        `;
        
        if (itemData) {
            descriptionInput.value = itemData.description;
            detailsContainer.querySelector('.item-rate').value = itemData.rate;
            detailsContainer.querySelector('.item-quantity').value = itemData.quantity || 1;
        }
        
        row.appendChild(descriptionInput);
        row.appendChild(detailsContainer);

        this.setupRowCalculation(row);
        return row;
    }

    findExistingItem(description) {
        const rows = this.container.querySelectorAll('.item-row');
        for (let row of rows) {
            const descInput = row.querySelector('.item-description');
            if (descInput.value === description) {
                return row;
            }
        }
        return null;
    }

    setupRowCalculation(row) {
        const rateInput = row.querySelector('.item-rate');
        const quantityInput = row.querySelector('.item-quantity');
        const amountInput = row.querySelector('.item-amount');

        const calculateAmount = () => {
            const rate = parseFloat(rateInput.value) || 0;
            const quantity = parseInt(quantityInput.value) || 0;
            amountInput.value = (rate * quantity).toFixed(2);
        };

        rateInput.addEventListener('input', calculateAmount);
        quantityInput.addEventListener('input', calculateAmount);
        calculateAmount(); // Calculate initial amount
    }

    addNewRow() {
        this.container.appendChild(this.createItemRow());
    }

    addNewRowWithData(itemData) {
        const existingRow = this.findExistingItem(itemData.description);
        
        if (existingRow) {
            // Incrémenter la quantité si l'item existe déjà
            const quantityInput = existingRow.querySelector('.item-quantity');
            quantityInput.value = parseInt(quantityInput.value) + 1;
            // Recalculer le montant
            const event = new Event('input');
            quantityInput.dispatchEvent(event);
        } else {
            // Créer une nouvelle ligne si l'item n'existe pas
            this.container.appendChild(this.createItemRow(itemData));
        }
    }

    setupEventListeners() {
        document.getElementById('addItem').addEventListener('click', () => this.addNewRow());
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                if (this.container.children.length > 1) {
                    e.target.closest('.item-row').remove();
                }
            }
        });
    }

    getItems() {
        const items = [];
        this.container.querySelectorAll('.item-row').forEach(row => {
            items.push({
                description: row.querySelector('.item-description').value,
                rate: parseFloat(row.querySelector('.item-rate').value),
                quantity: parseInt(row.querySelector('.item-quantity').value),
                amount: parseFloat(row.querySelector('.item-amount').value)
            });
        });
        return items;
    }

    saveItems() {
        const items = this.getItems();
        items.forEach(item => {
            if (item.description && item.rate) {
                this.savedItemsManager.saveItem({
                    description: item.description,
                    rate: item.rate
                });
            }
        });
    }
}
