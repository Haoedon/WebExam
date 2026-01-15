// Глобальная переменная для текущего ID заказа
let currentOrderId = null;

// Загрузка при инициализации
document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});

// Загрузка заказов
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const container = document.getElementById('ordersContainer');

    if (orders.length === 0) {
        container.innerHTML = '<p class="no-orders">У вас нет заказов</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'orders-table';
    
    // Заголовок таблицы
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>№ Заказа</th>
            <th>Дата оформления</th>
            <th>Состав</th>
            <th>Стоимость</th>
            <th>Доставка</th>
            <th>Действия</th>
        </tr>
    `;
    table.appendChild(thead);

    // Тело таблицы
    const tbody = document.createElement('tbody');
    orders.forEach((order, index) => {
        const row = document.createElement('tr');
        const date = new Date(order.timestamp);
        const formattedDate = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU');
        const itemsText = order.items.map(item => item.name).join(', ');
        const deliveryInfo = `${order.deliveryDate}<br>${getDeliveryTimeLabel(order.deliveryTime)}`;

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${formattedDate}</td>
            <td>${itemsText}</td>
            <td>${order.total}</td>
            <td>${deliveryInfo}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" title="Просмотр" onclick="openViewModal(${index})">👁️</button>
                    <button class="action-btn edit" title="Редактирование" onclick="openEditModal(${index})">✏️</button>
                    <button class="action-btn delete" title="Удаление" onclick="openDeleteModal(${index})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
}

// Получение текстового описания времени доставки
function getDeliveryTimeLabel(timeValue) {
    const timeMap = {
        'morning': '09:00 - 12:00',
        'afternoon': '12:00 - 15:00',
        'evening': '15:00 - 18:00',
        'late': '18:00 - 21:00'
    };
    return timeMap[timeValue] || timeValue;
}

// Открытие модального окна просмотра
function openViewModal(orderIndex) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[orderIndex];

    if (!order) return;

    const details = document.getElementById('viewOrderDetails');
    const itemsList = order.items.map(item => `<li>${item.name} - ${formatPrice(item.price)}</li>`).join('');

    details.innerHTML = `
        <div class="order-details">
            <div class="detail-row">
                <strong>ФИО:</strong>
                <span>${order.name}</span>
            </div>
            <div class="detail-row">
                <strong>Email:</strong>
                <span>${order.email}</span>
            </div>
            <div class="detail-row">
                <strong>Телефон:</strong>
                <span>${order.phone}</span>
            </div>
            <div class="detail-row">
                <strong>Адрес доставки:</strong>
                <span>${order.address}</span>
            </div>
            <div class="detail-row">
                <strong>Дата доставки:</strong>
                <span>${order.deliveryDate}</span>
            </div>
            <div class="detail-row">
                <strong>Время доставки:</strong>
                <span>${getDeliveryTimeLabel(order.deliveryTime)}</span>
            </div>
            <div class="detail-row">
                <strong>Товары:</strong>
            </div>
            <ul style="margin: 0.5rem 0; padding-left: 2rem;">
                ${itemsList}
            </ul>
            <div class="detail-row">
                <strong>Итого:</strong>
                <span>${order.total}</span>
            </div>
            ${order.comment ? `
            <div class="detail-row">
                <strong>Комментарий:</strong>
                <span>${order.comment}</span>
            </div>
            ` : ''}
        </div>
    `;

    openModal('viewModal');
}

// Открытие модального окна редактирования
function openEditModal(orderIndex) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders[orderIndex];

    if (!order) return;

    currentOrderId = orderIndex;

    document.getElementById('editOrderId').value = orderIndex;
    document.getElementById('editName').value = order.name;
    document.getElementById('editEmail').value = order.email;
    document.getElementById('editPhone').value = order.phone;
    document.getElementById('editAddress').value = order.address;
    document.getElementById('editDeliveryDate').value = order.deliveryDate;
    document.getElementById('editDeliveryTime').value = order.deliveryTime;
    document.getElementById('editComment').value = order.comment || '';

    openModal('editModal');
}

// Сохранение изменений заказа
function saveOrderChanges() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = parseInt(document.getElementById('editOrderId').value);

    if (orderIndex < 0 || orderIndex >= orders.length) {
        showNotification('Ошибка: заказ не найден', 'error');
        return;
    }

    // Обновление данных заказа
    orders[orderIndex].name = document.getElementById('editName').value;
    orders[orderIndex].email = document.getElementById('editEmail').value;
    orders[orderIndex].phone = document.getElementById('editPhone').value;
    orders[orderIndex].address = document.getElementById('editAddress').value;
    orders[orderIndex].deliveryDate = document.getElementById('editDeliveryDate').value;
    orders[orderIndex].deliveryTime = document.getElementById('editDeliveryTime').value;
    orders[orderIndex].comment = document.getElementById('editComment').value;

    // Сохранение в localStorage
    localStorage.setItem('orders', JSON.stringify(orders));

    closeModal('editModal');
    showNotification('Заказ успешно обновлён', 'success');
    loadOrders();
}

// Открытие модального окна удаления
function openDeleteModal(orderIndex) {
    document.getElementById('deleteOrderId').value = orderIndex;
    openModal('deleteModal');
}

// Подтверждение удаления
function confirmDelete() {
    const orderIndex = parseInt(document.getElementById('deleteOrderId').value);
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orderIndex < 0 || orderIndex >= orders.length) {
        showNotification('Ошибка: заказ не найден', 'error');
        return;
    }

    // Удаление заказа
    orders.splice(orderIndex, 1);
    localStorage.setItem('orders', JSON.stringify(orders));

    closeModal('deleteModal');
    showNotification('Заказ удалён', 'success');
    loadOrders();
}

// Открытие модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

// Закрытие модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Закрытие модального окна при клике вне его
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

// Уведомления
function showNotification(message, type = 'info') {
    const area = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    area.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
