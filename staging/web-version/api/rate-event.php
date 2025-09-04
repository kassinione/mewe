<?php
header('Content-Type: application/json');
require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

// Валидация данных
if (!isset($input['event_id'], $input['rating']) || 
    !is_numeric($input['event_id']) || 
    $input['rating'] < 1 || $input['rating'] > 5) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
    exit;
}

try {
    // Проверяем, существует ли мероприятие
    $stmt = $pdo->prepare("SELECT id FROM events WHERE id = ?");
    $stmt->execute([$input['event_id']]);
    if (!$stmt->fetch()) {
        throw new Exception('Мероприятие не найдено');
    }
    
    // Сохраняем оценку
    $stmt = $pdo->prepare("
        INSERT INTO event_ratings (event_id, user_id, rating, rated_at)
        VALUES (:event_id, :user_id, :rating, NOW())
        ON DUPLICATE KEY UPDATE rating = :rating, rated_at = NOW()
    ");
    
    $stmt->execute([
        ':event_id' => $input['event_id'],
        ':user_id' => $input['user_id'] ?? null,
        ':rating' => $input['rating']
    ]);
    
    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}