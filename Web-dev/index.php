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
        <div class="search-bar-container">
            <input type="text" class="search-input" id="searchInput" placeholder="Поиск...">
            <img src="static/icons/search.png" alt="Поиск" class="search-icon" id="searchIcon">
        </div>
        <img id="logo-png" src="static/icons/logo.png" alt="logo_png">
    </div>
    <?php include 'partials/footer.html'; ?>
</div>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<script>
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');

    searchInput.addEventListener('focus', () => {
        searchIcon.classList.add('active');
    });
    searchInput.addEventListener('blur', () => {
        searchIcon.classList.remove('active');
    });
    searchIcon.addEventListener('click', () => {
        searchInput.focus();
        searchIcon.classList.add('active');
    });
</script>
</body>
</html>