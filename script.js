document.addEventListener('DOMContentLoaded', () => {
    const stockForm = document.getElementById('stockForm');
    const stockTableBody = document.querySelector('#stockTable tbody');
    const stockList = document.getElementById('stockList');
    const searchInput = document.getElementById('search');
    const toggleViewButton = document.getElementById('toggleView');
    const tableView = document.getElementById('tableView');
    const listView = document.getElementById('listView');
    const sortCategory = document.getElementById('sortCategory');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    const itemsPerPage = 5;
    let currentPage = 1;

    // Load stored items
    let stockItems = JSON.parse(localStorage.getItem('stockItems')) || [];
    displayItems();

    stockForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const itemName = document.getElementById('itemName').value.trim();
        const itemQuantity = parseInt(document.getElementById('itemQuantity').value.trim(), 10);
        const itemCategory = document.getElementById('itemCategory').value.trim();

        if (itemName && !isNaN(itemQuantity) && itemQuantity > 0 && itemCategory) {
            const itemId = new Date().getTime();
            const newItem = { id: itemId, name: itemName, quantity: itemQuantity, category: itemCategory };
            stockItems.push(newItem);
            localStorage.setItem('stockItems', JSON.stringify(stockItems));
            displayItems();
            stockForm.reset();
        }
    });

    stockTableBody.addEventListener('click', handleTableActions);
    stockList.addEventListener('click', handleListActions);

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        displayItems();
    });

    toggleViewButton.addEventListener('click', () => {
        if (tableView.style.display === 'none') {
            tableView.style.display = '';
            listView.style.display = 'none';
            toggleViewButton.textContent = 'Switch to List View';
        } else {
            tableView.style.display = 'none';
            listView.style.display = '';
            toggleViewButton.textContent = 'Switch to Table View';
        }
    });

    sortCategory.addEventListener('change', () => {
        currentPage = 1;
        displayItems();
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayItems();
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage * itemsPerPage < stockItems.length) {
            currentPage++;
            displayItems();
        }
    });

    function displayItems() {
        const filteredItems = stockItems.filter(item => item.name.toLowerCase().includes(searchInput.value.toLowerCase()));
        const sortedItems = sortItems(filteredItems);
        const paginatedItems = paginateItems(sortedItems);

        stockTableBody.innerHTML = '';
        stockList.innerHTML = '';

        paginatedItems.forEach(item => {
            addItemToTable(item.id, item.name, item.quantity, item.category);
            addItemToList(item.id, item.name, item.quantity, item.category);
        });

        updatePaginationInfo(filteredItems.length);
    }

    function sortItems(items) {
        const sortBy = sortCategory.value;
        return items.sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return -1;
            if (a[sortBy] > b[sortBy]) return 1;
            return 0;
        });
    }

    function paginateItems(items) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return items.slice(startIndex, startIndex + itemsPerPage);
    }

    function updatePaginationInfo(totalItems) {
        pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalItems / itemsPerPage)}`;
    }

    function addItemToTable(id, name, quantity, category) {
        const row = document.createElement('tr');
        row.dataset.id = id;

        row.innerHTML = `
            <td>${name}</td>
            <td>${quantity}</td>
            <td>${category}</td>
            <td class="actions">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </td>
        `;

        stockTableBody.appendChild(row);
    }

    function addItemToList(id, name, quantity, category) {
        const listItem = document.createElement('li');
        listItem.dataset.id = id;

        listItem.innerHTML = `
            <span>${name} - ${quantity} (${category})</span>
            <div class="actions">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
            </div>
        `;

        stockList.appendChild(listItem);
    }

    function handleTableActions(e) {
        const row = e.target.closest('tr');
        const itemId = row.dataset.id;

        if (e.target.classList.contains('edit')) {
            editItem(itemId);
        } else if (e.target.classList.contains('delete')) {
            deleteItem(itemId);
        }
    }

    function handleListActions(e) {
        const listItem = e.target.closest('li');
        const itemId = listItem.dataset.id;

        if (e.target.classList.contains('edit')) {
            editItem(itemId);
        } else if (e.target.classList.contains('delete')) {
            deleteItem(itemId);
        }
    }

    function editItem(id) {
        const item = stockItems.find(item => item.id == id);
        if (item) {
            document.getElementById('itemName').value = item.name;
            document.getElementById('itemQuantity').value = item.quantity;
            document.getElementById('itemCategory').value = item.category;

            // Remove item from the table and list
            const row = stockTableBody.querySelector(`tr[data-id='${id}']`);
            const listItem = stockList.querySelector(`li[data-id='${id}']`);

            stockTableBody.removeChild(row);
            stockList.removeChild(listItem);

            const index = stockItems.findIndex(item => item.id == id);
            if (index !== -1) stockItems.splice(index, 1);
            localStorage.setItem('stockItems', JSON.stringify(stockItems));
        }
    }

    function deleteItem(id) {
        const row = stockTableBody.querySelector(`tr[data-id='${id}']`);
        const listItem = stockList.querySelector(`li[data-id='${id}']`);

        if (row) stockTableBody.removeChild(row);
        if (listItem) stockList.removeChild(listItem);

        const index = stockItems.findIndex(item => item.id == id);
        if (index !== -1) stockItems.splice(index, 1);
        localStorage.setItem('stockItems', JSON.stringify(stockItems));
    }
});
