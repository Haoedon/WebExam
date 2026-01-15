<!-- Файл для интеграции с сервером save_order.php -->

<?php
// save_order.php - обработка заказов

// Получить данные из POST запроса
$data = json_decode(file_get_contents('php://input'), true);

// Валидация данных
if (empty($data) || !isset($data['name']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Некорректные данные']);
    exit;
}

// Здесь можно добавить:
// 1. Проверку в базе данных
// 2. Отправку email уведомления
// 3. Сохранение в базу данных
// 4. Интеграцию с платежными системами

// Ответ сервера
$response = [
    'success' => true,
    'orderId' => uniqid('ORDER_'),
    'timestamp' => date('Y-m-d H:i:s'),
    'message' => 'Заказ успешно сохранён'
];

header('Content-Type: application/json');
echo json_encode($response);
?>

<!-- Интеграция с API -->

<!-- Для редактирования заказа в account.js -->
<!-- Обновите функцию saveOrderChanges() для отправки PUT запроса: -->

async function saveOrderChanges() {
    const orderIndex = parseInt(document.getElementById('editOrderId').value);
    
    const updateData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value,
        phone: document.getElementById('editPhone').value,
        address: document.getElementById('editAddress').value,
        deliveryDate: document.getElementById('editDeliveryDate').value,
        deliveryTime: document.getElementById('editDeliveryTime').value,
        comment: document.getElementById('editComment').value
    };

    try {
        // Отправить PUT запрос на сервер
        const response = await fetch(`/api/orders/${orderIndex}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            closeModal('editModal');
            showNotification('Заказ успешно обновлён', 'success');
            loadOrders();
        } else {
            showNotification('Ошибка при обновлении заказа', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при обновлении заказа', 'error');
    }
}

<!-- Для удаления заказа в account.js -->
<!-- Обновите функцию confirmDelete() для отправки DELETE запроса: -->

async function confirmDelete() {
    const orderIndex = parseInt(document.getElementById('deleteOrderId').value);

    try {
        // Отправить DELETE запрос на сервер
        const response = await fetch(`/api/orders/${orderIndex}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            closeModal('deleteModal');
            showNotification('Заказ удалён', 'success');
            loadOrders();
        } else {
            showNotification('Ошибка при удалении заказа', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при удалении заказа', 'error');
    }
}

<!-- Для оформления заказа в cart.js -->
<!-- Обновите функцию submitOrder() для отправки POST запроса: -->

async function submitOrder(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }

    const orderData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        newsletter: document.getElementById('newsletter').checked,
        address: document.getElementById('address').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        deliveryTime: document.getElementById('deliveryTime').value,
        comment: document.getElementById('comment').value,
        items: cart,
        total: document.getElementById('totalCost').textContent
    };

    try {
        // Отправить POST запрос на сервер
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Заказ успешно оформлен!', 'success');
            
            localStorage.removeItem('cart');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            showNotification('Ошибка при оформлении заказа', 'error');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showNotification('Ошибка при оформлении заказа', 'error');
    }
}

<!-- API Endpoints для интеграции с сервером -->

API Endpoints:

POST /api/orders
- Создание нового заказа
- Body: { name, email, phone, address, deliveryDate, deliveryTime, comment, items, total }
- Response: { success: true, orderId: string }

PUT /api/orders/:id
- Обновление заказа
- Body: { name, email, phone, address, deliveryDate, deliveryTime, comment }
- Response: { success: true }

DELETE /api/orders/:id
- Удаление заказа
- Response: { success: true }

GET /api/orders
- Получить список всех заказов (опционально)
- Response: { success: true, orders: [] }

<!-- Интеграция с платежной системой -->

<!-- Для добавления платежей, добавьте поле в форму: -->

<div class="form-group">
    <label for="paymentMethod">Способ оплаты</label>
    <select id="paymentMethod" name="paymentMethod" class="form-control" required>
        <option value="">Выберите способ оплаты</option>
        <option value="card">Карта</option>
        <option value="bank">Банковский перевод</option>
        <option value="cash">Наличные при доставке</option>
        <option value="yandex">Яндекс.Касса</option>
    </select>
</div>

<!-- Отправка платежа на Яндекс.Касса или подобный сервис -->

async function processPayment(orderData) {
    if (orderData.paymentMethod === 'card') {
        // Интеграция с Яндекс.Касса, Stripe и т.д.
        try {
            const paymentResponse = await fetch('/api/payment', {
                method: 'POST',
                body: JSON.stringify({
                    amount: orderData.total,
                    orderId: orderData.orderId,
                    description: 'Заказ автомобилей'
                })
            });
            
            if (paymentResponse.ok) {
                const payment = await paymentResponse.json();
                // Переместить пользователя на страницу платежа
                window.location.href = payment.paymentUrl;
            }
        } catch (error) {
            console.error('Ошибка платежа:', error);
        }
    }
}

<!-- Email уведомления -->

<?php
// Функция отправки email с подтверждением заказа
function sendOrderConfirmationEmail($email, $orderData) {
    $to = $email;
    $subject = 'Подтверждение заказа CarDiller.On';
    
    $message = "
        <h2>Спасибо за ваш заказ!</h2>
        <p>Ваш номер заказа: {$orderData['orderId']}</p>
        <p>Дата доставки: {$orderData['deliveryDate']}</p>
        <p>Адрес: {$orderData['address']}</p>
        <p>Итого: {$orderData['total']}</p>
        <p>С вами свяжутся в ближайшее время для уточнения деталей.</p>
    ";
    
    $headers = "Content-Type: text/html; charset=UTF-8\r\n";
    mail($to, $subject, $message, $headers);
}
?>

<!-- SMS уведомления (интеграция с SMPP) -->

<?php
// Функция отправки SMS
function sendOrderSMS($phone, $orderData) {
    // Интеграция с сервисом SMS (например, twillio.com)
    $message = "CarDiller.On: Ваш заказ #{$orderData['orderId']} принят. " .
               "Доставка: {$orderData['deliveryDate']}. " .
               "Сумма: {$orderData['total']}";
    
    // Отправить SMS через API
}
?>
