<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="{{ url_for('static', filename='css/styles.css') }}" rel="stylesheet">
    <title>MeWe</title>
</head>
<body>
    <div class="Main">
        <h1>Тестовое приложение</h1>
        <img src="{{ url_for('static', filename='bot.png') }}" alt="">
        <p></p>
        <button class="btn f-btn">Тест отправки данных</button>
    </div>
    <form class="test-form">    
        <input type="text" placeholder="Введите название" class="title-inp">
        <input type="text" placeholder="Введите описание" class="desc-inp">
        <input type="text" placeholder="Введите количество участников" class="text-inp">
        <button class="btn s-btn">Отправить</button>
    </form>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="{{ url_for('static', filename='js/scripts.js') }}"></script>
</body>
</html>