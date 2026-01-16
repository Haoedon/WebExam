<?php
// test_simple.php - простой тест

header('Content-Type: application/json; charset=utf-8');

// Проверяем, получены ли POST данные
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $fio = isset($_POST['fio']) ? $_POST['fio'] : 'не указано';
    $email = isset($_POST['email']) ? $_POST['email'] : 'не указано';
    $phone = isset($_POST['phone']) ? $_POST['phone'] : 'не указано';
    
    echo json_encode([
        'status' => 'success',
        'message' => 'POST данные получены',
        'fio' => $fio,
        'email' => $email,
        'phone' => $phone,
        'all_post_keys' => array_keys($_POST),
        'post_count' => count($_POST)
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Метод должен быть POST',
        'method' => $_SERVER['REQUEST_METHOD']
    ]);
}
?>
