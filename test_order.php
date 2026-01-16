<?php
// test_order.php - тест для проверки сохранения заказа

header('Content-Type: application/json; charset=utf-8');

// Эмуляция тестовых данных
$test_order = [
    'fio' => 'Иван Иванов',
    'email' => 'ivan@example.com',
    'phone' => '+7 (999) 123-45-67',
    'address' => 'Москва, ул. Тестовая, д. 1',
    'deliveryDate' => '2024-01-20',
    'deliveryTime' => 'morning',
    'comment' => 'Тестовый заказ',
    'newsletter' => 'on',
    'items' => [
        ['id' => 'nissan_skyline', 'price' => 500000, 'name' => 'Nissan Skyline'],
        ['id' => 'toyota_ae86', 'price' => 450000, 'name' => 'Toyota AE86']
    ],
    'total' => 950200
];

$orders_file = 'orders.json';
$orders = [];

// Загрузить существующие заказы
if (file_exists($orders_file)) {
    $json_data = file_get_contents($orders_file);
    $orders = json_decode($json_data, true) ?? [];
}

// Создать новый заказ
$order_id = time() . '_' . uniqid();
$new_order = [
    'order_id' => $order_id,
    'fio' => $test_order['fio'],
    'email' => $test_order['email'],
    'phone' => $test_order['phone'],
    'address' => $test_order['address'],
    'delivery_date' => $test_order['deliveryDate'],
    'delivery_time' => $test_order['deliveryTime'],
    'comment' => $test_order['comment'],
    'newsletter' => $test_order['newsletter'] === 'on' ? true : false,
    'items' => $test_order['items'],
    'total_price' => $test_order['total'],
    'created_at' => date('Y-m-d H:i:s')
];

$orders[] = $new_order;

// Попытка сохранить
$success = file_put_contents($orders_file, json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if ($success) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Тестовый заказ успешно сохранен',
        'order_id' => $order_id,
        'file' => $orders_file,
        'file_exists' => file_exists($orders_file),
        'file_readable' => is_readable($orders_file),
        'file_writable' => is_writable(dirname($orders_file))
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Ошибка при сохранении',
        'file' => $orders_file,
        'file_exists' => file_exists($orders_file),
        'file_readable' => is_readable($orders_file),
        'dir_writable' => is_writable(dirname($orders_file))
    ]);
}
?>
