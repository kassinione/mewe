<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Прошедшие мероприятия | MeWe</title>
    <link href="static/css/main.css" rel="stylesheet">
    <link href="static/css/last-events.css" rel="stylesheet">
    <link href="static/css/footer.css" rel="stylesheet">
</head>
<body>
<div class="wrapper">
    <!-- Плашка с заголовком -->
    <div class="header-plate">
        <h2>Прошедшие мероприятия</h2>
    </div>
    
    <!-- Контейнер мероприятий -->
    <div class="events-container">
        <?php
            // Подключение к базе данных
            require_once 'config/db.php';
            
            try {
                $stmt = $pdo->prepare("
                    SELECT 
                        e.*,
                        c.name AS category_name,
                        c.icon AS category_icon,
                        COUNT(DISTINCT p.id) AS participants_count,
                        AVG(er.rating) AS avg_rating
                    FROM events e
                    LEFT JOIN participants p ON e.id = p.event_id
                    LEFT JOIN event_ratings er ON e.id = er.event_id
                    LEFT JOIN categories c ON e.category_id = c.id
                    WHERE e.event_date < NOW()
                    GROUP BY e.id
                    ORDER BY e.event_date DESC
                    LIMIT 20
                ");
                $stmt->execute();
                $events = $stmt->fetchAll();

                if (empty($events)) {
                    echo '<p class="no-events">Нет прошедших мероприятий</p>';
                } else {
                    foreach ($events as $event) {
                        echo '
                        <div class="event-card" data-event-id="' . $event['id'] . '">
                            <div class="event-header">
                                <span class="event-category" title="' . htmlspecialchars($event['category_name']) . '">
                                    ' . ($event['category_icon'] ? '🔹' : '') . htmlspecialchars($event['category_name']) . '
                                </span>
                                <span class="event-date">' . date('d.m.Y H:i', strtotime($event['event_date'])) . '</span>
                            </div>
                            
                            <h3>' . htmlspecialchars($event['title']) . '</h3>
                            
                            <div class="event-meta">
                                <span>📍 ' . htmlspecialchars($event['location']) . '</span>
                                <span>👥 ' . $event['participants_count'] . ' участников</span>';
                                
                        if ($event['avg_rating']) {
                            echo '<span>⭐ ' . round($event['avg_rating'], 1) . '/5</span>';
                        }
                        
                        echo '</div>
                            
                            <div class="rating-section">
                                <div class="rating-stars">';
                                
                        for ($i = 1; $i <= 5; $i++) {
                            echo '<span class="star" data-value="' . $i . '">' . 
                                ($i <= round($event['avg_rating'] ?? 0) ? '★' : '☆') . '</span>';
                        }
                        
                        echo '</div>
                            </div>
                        </div>';
                    }
                }
            } catch (PDOException $e) {
                echo '<p class="error">Ошибка загрузки мероприятий: ' . htmlspecialchars($e->getMessage()) . '</p>';
            }
        ?>
    </div>
    
    <?php include 'partials/footer.html'; ?>
</div>

<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="static/js/last-events.js"></script>
</body>
</html>