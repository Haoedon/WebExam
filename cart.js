// Загрузка данных при инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded запущен');
    // Инициализируем стоимость доставки по умолчанию
    const deliveryCostElement = document.getElementById('deliveryCost');
    if (deliveryCostElement && !deliveryCostElement.textContent) {
        deliveryCostElement.textContent = formatPrice(200);
    }
    
    loadCartItems().then(() => {
        console.log('loadCartItems завершён, вызываем setupFormListeners и calculateTotalCost');
        setupFormListeners();
        calculateTotalCost();
    });
});

// Загрузка товаров из корзины
async function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const grid = document.getElementById('cartItemsGrid');

    if (cart.length === 0) {
        grid.innerHTML = '<p class="empty-cart-message">Корзина пуста. Перейдите в каталог, чтобы добавить товары.</p>';
        document.getElementById('checkoutForm').style.display = 'none';
        return;
    }

    try {
        const response = await fetch('cars.json');
        const allCars = await response.json();
        
        grid.innerHTML = '';
        let totalPrice = 0;

        cart.forEach(cartItem => {
            const car = allCars.find(c => c.latinName === cartItem.id);
            if (car) {
                const discount = Math.floor(Math.random() * 30);
                const price = cartItem.price;
                totalPrice += price;

                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${car.image}" alt="${car.name}" class="product-image" onerror="this.src='https://via.placeholder.com/250x200?text=${car.name}'">
                    <div class="product-info">
                        <h3 class="product-name">${car.name}</h3>
                        <div class="product-rating">⭐ 4.5 / 5</div>
                        <div class="product-price">
                            <span class="price-current">${formatPrice(price)}</span>
                        </div>
                        <button class="remove-btn" onclick="removeFromCart('${cartItem.id}', '${car.name}')">
                            Удалить из корзины
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            }
        });

        // Обновление итоговой стоимости товаров и сохранение числового значения
        const productsElement = document.getElementById('productsTotal');
        productsElement.textContent = formatPrice(totalPrice);
        productsElement.dataset.value = totalPrice;
        console.log('Товары загружены. totalPrice =', totalPrice);
        console.log('Вызываем updateDeliveryCost()');
        updateDeliveryCost();
        // Убедимся, что итог пересчитывается
        console.log('Вызываем calculateTotalCost()');
        calculateTotalCost();
        return totalPrice;
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        showNotification('Ошибка при загрузке товаров', 'error');
        return 0;
    }
}

// Удаление товара из корзины
async function removeFromCart(carId, carName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== carId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    showNotification(`${carName} удалён из корзины`, 'success');
    await loadCartItems();
    calculateTotalCost();
}

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

// Настройка слушателей форм
function setupFormListeners() {
    const form = document.getElementById('checkoutForm');
    
    if (form) {
        // Обновление стоимости доставки при изменении даты и времени
        document.getElementById('deliveryDate').addEventListener('change', updateDeliveryCost);
        document.getElementById('deliveryTime').addEventListener('change', updateDeliveryCost);

        // Отправка формы
        form.addEventListener('submit', submitOrder);
    }
}

// Расчёт стоимости доставки
function updateDeliveryCost() {
    const dateInput = document.getElementById('deliveryDate').value;
    const timeInput = document.getElementById('deliveryTime').value;
    
    let deliveryCost = 200; // Базовая стоимость
    
    // Если оба поля заполнены, рассчитываем специальную стоимость
    if (dateInput && timeInput) {
        // Проверка - выходной ли это день
        const date = new Date(dateInput);
        const dayOfWeek = date.getDay(); // 0 = воскресенье, 6 = суббота
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Выходной день
            deliveryCost += 300;
        } else {
            // Рабочий день
            if (timeInput === 'evening' || timeInput === 'late') {
                // Вечерние часы (с 18:00)
                deliveryCost += 200;
            }
        }
    }

    const deliveryCostElement = document.getElementById('deliveryCost');
    deliveryCostElement.textContent = formatPrice(deliveryCost);
    deliveryCostElement.dataset.value = deliveryCost;
    calculateTotalCost();
}

// Функция суммирования доставки и товаров
function sumDeliveryAndProducts() {
    const productsElement = document.getElementById('productsTotal');
    const deliveryCostElement = document.getElementById('deliveryCost');
    
    let productsTotal = parseFloat(productsElement?.dataset?.value) || 0;
    let deliveryCost = parseFloat(deliveryCostElement?.dataset?.value) || 200;
    
    console.log('sumDeliveryAndProducts: productsTotal =', productsTotal, ', deliveryCost =', deliveryCost);
    return productsTotal + deliveryCost;
}

// Расчёт итоговой стоимости
function calculateTotalCost() {
    const totalCostElement = document.getElementById('totalCost');
    const total = sumDeliveryAndProducts();
    
    console.log('calculateTotalCost вызвана. Сумма товаров + Доставка =', total);
    console.log('productsTotal:', parseFloat(document.getElementById('productsTotal')?.dataset?.value));
    console.log('deliveryCost:', parseFloat(document.getElementById('deliveryCost')?.dataset?.value));
    
    totalCostElement.textContent = formatPrice(total);
    totalCostElement.dataset.value = total;
}

// Отправка заказа
async function submitOrder(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }

    // Валидация формы
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const deliveryDate = document.getElementById('deliveryDate').value;
    const deliveryTime = document.getElementById('deliveryTime').value;

    if (!name || !email || !phone || !address || !deliveryDate || !deliveryTime) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }

    // Подготовка данных для отправки на сервер
    const formData = new FormData();
    formData.append('fio', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('address', address);
    formData.append('deliveryDate', deliveryDate);
    formData.append('deliveryTime', deliveryTime);
    formData.append('comment', document.getElementById('comment').value.trim());
    formData.append('newsletter', document.getElementById('newsletter').checked ? 'on' : 'off');
    
    // Отправляем информацию о товарах как JSON строку
    const total = parseFloat(document.getElementById('totalCost').dataset.value) || 0;
    const cart_data = JSON.stringify({
        items: cart,
        total: total
    });
    formData.append('cart_data', cart_data);

    console.log('Отправка заказа:', {
        fio: name,
        email: email,
        phone: phone,
        cart_items: cart.length,
        total: total
    });

    try {
        const response = await fetch('save_order.php', {
            method: 'POST',
            body: formData
        });

        console.log('Статус ответа:', response.status);
        
        const data = await response.json();
        console.log('Ответ сервера:', data);

        if (response.ok) {
            // Успешный заказ
            showNotification('Заказ успешно оформлен!', 'success');
            
            // Очистка корзины
            localStorage.removeItem('cart');
            
            // Перенаправление на главную страницу через 2 секунды
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            console.error('Ошибка сервера:', data);
            showNotification(data.error || 'Ошибка при оформлении заказа', 'error');
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
        showNotification('Ошибка подключения. Заказ сохранен локально.', 'error');
        // Если сервер недоступен, сохраняем заказ локально
        const orderData = {
            name: name,
            email: email,
            phone: phone,
            newsletter: document.getElementById('newsletter').checked,
            address: address,
            deliveryDate: deliveryDate,
            deliveryTime: deliveryTime,
            comment: document.getElementById('comment').value.trim(),
            items: cart,
            total: total,
            timestamp: new Date().toISOString()
        };
        saveOrderLocally(orderData);
    }
}

// Локальное сохранение заказа
function saveOrderLocally(orderData) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    showNotification('Заказ успешно оформлен (сохранён локально)!', 'success');
    
    // Очистка корзины
    localStorage.removeItem('cart');
    
    // Перенаправление на главную страницу через 2 секунды
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}
