<!-- Пример использования системы уведомлений -->

<!-- На любой странице можно использовать функцию showNotification() -->

<script>
// Пример 1: Успешное добавление в корзину
showNotification('Toyota Corolla добавлена в корзину', 'success');

// Пример 2: Ошибка при загрузке
showNotification('Ошибка при загрузке каталога', 'error');

// Пример 3: Информационное сообщение
showNotification('Фильтры применены', 'info');
</script>

<!-- Пример HTML модального окна для кастомизации -->

<div id="customModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">Заголовок</div>
        <div class="modal-body">
            <!-- Контент -->
        </div>
        <div class="modal-footer">
            <button class="modal-btn modal-btn-secondary" onclick="closeModal('customModal')">Отмена</button>
            <button class="modal-btn modal-btn-primary">Подтвердить</button>
        </div>
    </div>
</div>

<!-- Пример использования фильтров в каталоге -->

<script>
// Фильтр по категориям
const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', applyFilters);
});

// Фильтр по цене
document.getElementById('priceFrom').addEventListener('change', applyFilters);
document.getElementById('priceTo').addEventListener('change', applyFilters);

// Фильтр по скидкам
document.getElementById('discountOnly').addEventListener('change', applyFilters);
</script>

<!-- Пример работы с localStorage для корзины -->

<script>
// Получить текущую корзину
const cart = JSON.parse(localStorage.getItem('cart')) || [];

// Добавить товар
function addToCart(carId, carName, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
        id: carId,
        name: carName,
        price: price,
        quantity: 1
    });
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Удалить товар
function removeFromCart(carId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== carId);
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Получить количество товаров
function getCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.length;
}

// Очистить корзину
function clearCart() {
    localStorage.removeItem('cart');
}
</script>

<!-- Пример работы с заказами -->

<script>
// Получить все заказы
const orders = JSON.parse(localStorage.getItem('orders')) || [];

// Создать новый заказ
function createOrder(orderData) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push({
        ...orderData,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Обновить заказ
function updateOrder(orderIndex, updatedData) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orderIndex >= 0 && orderIndex < orders.length) {
        orders[orderIndex] = { ...orders[orderIndex], ...updatedData };
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// Удалить заказ
function deleteOrder(orderIndex) {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.splice(orderIndex, 1);
    localStorage.setItem('orders', JSON.stringify(orders));
}
</script>

<!-- Пример расчёта стоимости доставки -->

<script>
function calculateDeliveryPrice(deliveryDate, deliveryTime) {
    let baseCost = 200; // Базовая стоимость
    
    const date = new Date(deliveryDate);
    const dayOfWeek = date.getDay(); // 0 = воскресенье, 6 = суббота
    
    // Выходные дни (суббота и воскресенье)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseCost += 300;
    } else {
        // Вечерние часы (с 18:00)
        if (deliveryTime === 'evening' || deliveryTime === 'late') {
            baseCost += 200;
        }
    }
    
    return baseCost;
}

// Пример использования
const cost = calculateDeliveryPrice('2024-01-20', 'evening');
console.log(`Стоимость доставки: ${cost}₽`); // 400₽
</script>

<!-- Пример форматирования цены -->

<script>
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

console.log(formatPrice(900000)); // 900 000 ₽
console.log(formatPrice(1250000)); // 1 250 000 ₽
</script>
