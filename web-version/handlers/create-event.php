<?php
if (!isset($_SERVER['REQUEST_METHOD'])) {
    exit("Этот скрипт нужно запускать через веб-сервер, а не напрямую.\n");
}

require_once __DIR__ . '/../config/db.php';

$title = $_POST['title'] ?? '';
$place = $_POST['place'] ?? '';
$description = $_POST['description'] ?? '';
$category = $_POST['category'] ?? '';
$participants = $_POST['participants'] ?? 0;
$date = $_POST['date'] ?? '';
$time = $_POST['time'] ?? '';

$eventDateTime = date('Y-m-d H:i:s', strtotime("$date $time"));

try {
    $stmt = $pdo->prepare("
        INSERT INTO events (title, location, description, category_id, max_participants, event_date)
        VALUES (:title, :location, :description, :category_id, :max_participants, :event_date)
    ");
    $stmt->execute([
        ':title' => $title,
        ':location' => $place,
        ':description' => $description,
        ':category_id' => $category,
        ':max_participants' => $participants,
        ':event_date' => $eventDateTime,
    ]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
