<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($title) ? $title : 'MeWe'; ?></title>
    <link href="static/css/main.css" rel="stylesheet">
    <link href="static/css/my-events.css" rel="stylesheet">
    <link href="static/css/footer.css" rel="stylesheet">
</head>
<body>
<div class="wrapper">
    <div class="main">
        <button class="new-event-btn">+</button>
    </div>
    <?php include 'partials/create-form.php'; ?>
    <?php include 'partials/footer.html'; ?>
</div>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script src="static/js/scripts.js"></script>
</body>
</html>