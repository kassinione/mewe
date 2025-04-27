<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WeWe - вместе интереснее</title>
    <link href="{{ url_for('static', filename='css/styles.css') }}" rel="stylesheet">
</head>
<body>
    <header class="top-nav">
        <div class="tab">пример 1</div>
        <div class="tab">пример 1</div>
        <div class="tab">пример 1</div>
        <div class="tab">пример 1</div>
    </header>
    <div class="content">
        <div class="content-block"></div>
        <div class="content-block"></div>
        <div class="content-block"></div>
        <div class="content-block"></div>
        <div class="content-block"></div>
        <div class="content-block"></div>
    </div>
    <form class="test-form">    
        <input type="text" placeholder="Введите заголовок" class="title-inp">
        <input type="text" placeholder="Введите описание" class="desc-inp">
        <input type="text" placeholder="Введите текст" class="text-inp">
        <button class="btn s-btn">Отправить</button>
    </form>
    <script src="{{ url_for('static',filename='js/jquery-3.3.1.min.js') }}"></script>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="{{ url_for('static',filename='js/scripts.js') }}"></script>
</body>
</html>