
<?php
// Пример массива мероприятий
$events = [
    [
        'author' => 'Ник',
        'avatar' => 'static/icons/bot.png',
        'datetime' => '2025-05-25 16:30',
        'text' => 'аааааааааа'
    ],
    [
        'author' => 'Олег',
        'avatar' => 'static/icons/bot.png',
        'datetime' => '2025-05-25 13:00',
        'text' => 'Приглашаю на обед'
    ],
    
    
];

$now = date('Y-m-d H:i');
$upcoming = [];
$past = [];

foreach ($events as $event) {
    if ($event['datetime'] > $now) {
        $upcoming[] = $event;
    } else {
        $past[] = $event;
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($title) ? $title : 'MeWe'; ?></title>
    <link href="static/css/events-history.css" rel="stylesheet">
    <link href="static/css/footer.css" rel="stylesheet">
</head>
<body>
<div class="events-section">
    <div class="section-title line-events-one">
        <span>Мероприятия, на которые вы записаны:</span>
    </div>
    <?php if (count($upcoming) === 0): ?>
        <div style="text-align:center;color:#888;">Нет записанных мероприятий</div>
    <?php endif; ?>
    <?php foreach ($upcoming as $event): ?>
        <div class="event-card">
            <img class="avatar" src="<?= htmlspecialchars($event['avatar']) ?>" alt="avatar">
            <div class="event-info">
                <div class="event-header">
                    <span class="event-author"><?= htmlspecialchars($event['author']) ?></span>
                    <span class="event-date">
                        <?= date('j F H:i', strtotime($event['datetime'])) ?>
                    </span>
                </div>
                <div class="event-text"><?= htmlspecialchars($event['text']) ?></div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<div class="events-section">
    <div class="section-title">
        <span>Прошедшие мероприятия:</span>
    </div>
    <?php if (count($past) === 0): ?>
        <div style="text-align:center;color:#888;">Нет прошедших мероприятий</div>
    <?php endif; ?>
    <?php foreach ($past as $event): ?>
        <div class="event-card">
            <img class="avatar" src="<?= htmlspecialchars($event['avatar']) ?>" alt="avatar">
            <div class="event-info">
                <div class="event-header">
                    <span class="event-author"><?= htmlspecialchars($event['author']) ?></span>
                    <span class="event-date">
                        <?= date('j F H:i', strtotime($event['datetime'])) ?>
                    </span>
                </div>
                <div class="event-text"><?= htmlspecialchars($event['text']) ?></div>
            </div>
        </div>
    <?php endforeach; ?>
</div>
    <?php include 'footer.html'; ?>
</div>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="static/js/scripts.js"></script>
</body>
</html>