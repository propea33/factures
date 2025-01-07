class ItemManager {
    constructor() {
        this.container = document.getElementById('itemsContainer');
        this.addInitialRow();
        this.setupEventListeners();
    }

    addInitialRow() {
        this.addNewRow();
    }

    createItemRow() {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <input type="text" class="item-description" placeholder="Description" required>
            <input type="number" class="item-rate" placeholder="Taux" step="0.01" min="0" required>
            <input type="number" class="item-quantity" placeholder="Quantité" min="1" value="1" required>
            <input type="number" class="item-amount" placeholder="Montant" readonly>
            <button type="button" class="remove-item">×</button>
        `;

        this.setupRowCalculation(row);
        return row;
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
    }

    addNewRow() {
        this.container.appendChild(this.createItemRow());
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
}
