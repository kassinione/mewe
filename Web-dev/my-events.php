<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($title) ? $title : 'MeWe'; ?></title>
    <link href="static/css/common.css" rel="stylesheet">
    <link href="static/css/main.css" rel="stylesheet">
    <link href="static/css/my-events.css" rel="stylesheet">
    <link href="static/css/footer.css" rel="stylesheet">
</head>
<body>
<div class="wrapper">
    <div class="main">
        <button class="new-event-btn">+</button>
    </div>
    <form class="create-form" id="event-form" method="POST" action="handlers/create-event.php">
        <div class="close-btn" id="close-form">&times;</div>
        <h1>Создание мероприятия</h1>

        <label>Категория 
            <select name="category">
                <?php // Вставка категорий из базы
                    require_once 'config/db.php';
                    $stmt = $pdo->query("SELECT id, name FROM categories");
                    while ($row = $stmt->fetch()) {
                        echo '<option value="' . $row['id'] . '">' . htmlspecialchars($row['name']) . '</option>';
                    }
                ?>
            </select>
        </label>

        <label>Место
            <input type="text" name="place" required>
        </label>

        <label>Название
            <input type="text" name="title" required>
        </label>

        <div class="compact-row">
            <label>Дата
                <input type="date" name="date" required>
            </label>
            <label>Время
                <input type="time" name="time" required>
            </label>
            <label>Кол-во чел.
                <div class="input-with-icon">
                    <input type="number" name="participants" placeholder="" min="1">
                </div>
            </label>
        </div>

        <label>Описание
            <textarea name="description"></textarea>
        </label>
        <div class="required-note">все поля обязательны для заполнения</div>

        <button class="btn s-btn" type="submit">СОЗДАТЬ</button>
    </form>

    <div id="form-message" class="form-message"></div>

    <?php include 'partials/footer.html'; ?>
</div>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('event-form');
    form.addEventListener('submit', function(e) {
        let valid = true;
        form.querySelectorAll('[required]').forEach(el => {
            if (!el.value) {
                el.classList.add('invalid');
                valid = false;
            } else {
                el.classList.remove('invalid');
            }
        });
        if (!valid) e.preventDefault();
    });
    form.querySelectorAll('[required]').forEach(el => {
        el.addEventListener('input', function() {
            if (el.value) el.classList.remove('invalid');
        });
    });
});
</script>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="static/js/my-events.js"></script>
<script src="static/js/create-event.js"></script>
</body>
</html>