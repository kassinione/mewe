<?php
// Отключаем вывод ошибок в ответ
ini_set('display_errors', 0);
error_reporting(0);

// Устанавливаем обработчик ошибок
function handleError($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'PHP Error: ' . $errstr
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
set_error_handler('handleError');

// Получаем origin запроса
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Разрешенные origins для Live Server
$allowed_origins = [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501'
];

// Проверяем origin и устанавливаем заголовок
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

// Устанавливаем остальные CORS заголовки
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

// Получаем метод запроса
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Обрабатываем preflight запрос
if ($request_method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Подключаемся к базе данных
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=mewe_app;charset=utf8mb4',
        'root',
        '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка подключения к базе данных: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // Получаем параметры запроса
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? (int)$_GET['category'] : 0;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $per_page = isset($_GET['per_page']) ? max(1, (int)$_GET['per_page']) : 10;

    // Базовый SQL запрос
    $sql = "SELECT e.*, c.name as category_name, c.icon as category_icon,
            (SELECT COUNT(*) FROM event_registrations WHERE event_id = e.id) as registered_count
            FROM events e 
            LEFT JOIN categories c ON e.category_id = c.id 
            WHERE e.event_date >= CURDATE()";
    $params = [];

    // Добавляем условия поиска
    if ($search) {
        $sql .= " AND (
            e.title LIKE ? OR 
            e.description LIKE ? OR 
            e.location LIKE ?
        )";
        $search_param = "%$search%";
        $params[] = $search_param;
        $params[] = $search_param;
        $params[] = $search_param;
    }

    // Фильтр по категории
    if ($category > 0) {
        $sql .= " AND e.category_id = ?";
        $params[] = $category;
    }

    // Получаем общее количество событий
    $count_sql = "SELECT COUNT(*) FROM events e WHERE e.event_date >= CURDATE()";
    if ($search) {
        $count_sql .= " AND (
            e.title LIKE ? OR 
            e.description LIKE ? OR 
            e.location LIKE ?
        )";
    }
    if ($category > 0) {
        $count_sql .= " AND e.category_id = ?";
    }

    $stmt = $pdo->prepare($count_sql);
    $stmt->execute($params);
    $total = $stmt->fetchColumn();

    // Добавляем сортировку и пагинацию
    $sql .= " ORDER BY e.event_date ASC LIMIT ? OFFSET ?";
    $params[] = $per_page;
    $params[] = ($page - 1) * $per_page;

    // Получаем события
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $events = $stmt->fetchAll();

    // Форматируем даты и добавляем время до события
    foreach ($events as &$event) {
        $event_date = new DateTime($event['event_date']);
        $now = new DateTime();
        $interval = $now->diff($event_date);
        
        $event['formatted_date'] = $event_date->format('d.m.Y H:i');
        
        if ($interval->d == 0) {
            $event['time_until'] = 'Сегодня';
        } elseif ($interval->d == 1) {
            $event['time_until'] = 'Завтра';
        } else {
            $event['time_until'] = $interval->format('%d дней');
        }
    }

    // Формируем ответ
    $response = [
        'success' => true,
        'data' => [
            'events' => $events,
            'pagination' => [
                'total' => $total,
                'per_page' => $per_page,
                'current_page' => $page,
                'last_page' => ceil($total / $per_page)
            ]
        ]
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка сервера: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

