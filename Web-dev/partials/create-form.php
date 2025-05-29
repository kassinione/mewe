<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Создание мероприятия</title>
    <link rel="stylesheet" href="static/css/style.css">
</head>
<body>
    <form class="create-form" id="event-form" method="POST" action="handlers/create-event.php">
        <h1>Создание мероприятия</h1>

        <label>Категория 
            <select name="category">
                <?php
                // Вставка категорий из базы
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
                    <input type="number" name="participants" placeholder="Число" min="1">
                </div>
            </label>
        </div>

        <label>Описание
            <textarea name="description"></textarea>
        </label>

        <button class="btn s-btn" type="submit">СОЗДАТЬ</button>
    </form>
<script src="\static\js\create-event.js"></script>
</body>
</html>
