<?php
header('Content-Type: application/json');
require_once '../config/db.php'; // путь к твоему файлу подключения к БД

$search = $_GET['search'] ?? '';
$category = $_GET['category'] ?? '';

$sql = "SELECT e.id, e.title, e.place, e.event_date, c.name AS category_name
        FROM events e
        JOIN categories c ON e.category_id = c.id
        WHERE 1=1";

$params = [];

if ($search !== '') {
    $sql .= " AND e.title LIKE :search";
    $params[':search'] = '%' . $search . '%';
}

if ($category !== '') {
    // Фильтруем по ID категории (числовое значение)
    $sql .= " AND c.id = :category_id";
    $params[':category_id'] = (int)$category;
}

$sql .= " ORDER BY e.event_date DESC LIMIT 50";

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($events);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка запроса к базе данных']);
}

