<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($title) ? $title : 'MeWe'; ?></title>
    <link href="static/css/main.css" rel="stylesheet">
    <link href="static/css/footer.css" rel="stylesheet">
</head>
<body>
<div class="wrapper">
    <div class="main">
        <img id="logo-png" src="static/icons/logo.png" alt="logo_png">
    </div>
    <?php include 'footer.html'; ?>
</div>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
</body>
</html>