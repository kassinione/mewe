<?php
require_once __DIR__ . '/config/db.php';

// Получаем список категорий для фильтра
$categories = $pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll();
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <link href="static/css/common.css" rel="stylesheet">
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php echo isset($title) ? $title : 'MeWe'; ?></title>
    <link href="static/css/main.css" rel="stylesheet" />
    <link href="static/css/footer.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
<div class="wrapper">
    <div class="main">
        <div class="search-bar-container" style="display: flex; align-items: center; gap: 8px;">
            <div class="search-icon-left">
                <img src="static/icons/search.png" alt="Поиск" />
            </div>
            <input type="text" class="search-input" id="searchInput" placeholder="Поиск..." aria-label="Поиск мероприятий" />
            <div class="categories-tab" id="categoriesTab" tabindex="0" role="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Выбор категории">
                <img src="static/icons/categories.png" alt="Категории" class="categories-icon" />
                <span>Категории</span>
            </div>
        </div>
        <div id="eventsContainer" class="events-container">
            <!-- Здесь будут динамически появляться карточки мероприятий -->
        </div>

        
        <img id="logo-png" src="static/icons/logo.png" alt="logo_png" style="margin-top: 40px;" />
    </div>

    <?php include 'partials/footer.html'; ?>
</div>

<!-- Модальное окно категорий -->
<?php
require_once 'config/db.php';
$stmt = $pdo->query("SELECT id, name, icon FROM categories ORDER BY name");
$categories = $stmt->fetchAll();
?>
<div class="categories-modal" id="categoriesModal" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-overlay" id="modalOverlay" tabindex="-1"></div>
    <div class="modal-content">
        <button class="modal-close" id="modalClose" aria-label="Закрыть">&times;</button>
        <h2 id="modalTitle">Категории</h2>
        <div class="events-container categories-container">
            <?php foreach ($categories as $category): ?>
                <div class="event-card" tabindex="0" data-category-id="<?= $category['id'] ?>" data-category-name="<?= htmlspecialchars($category['name']) ?>">
                    <div class="event-header">
                        <span class="event-category">
                            <?= $category['icon'] ? htmlspecialchars($category['icon']) : '🔹' ?>
                            <?= htmlspecialchars($category['name']) ?>
                        </span>
                    </div>
                    <h3><?= htmlspecialchars($category['name']) ?></h3>
                    <div class="event-meta">
                        <!-- Можно добавить описание категории, если нужно -->
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<script src="https://telegram.org/js/telegram-web-app.js"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const categoriesTab = document.getElementById('categoriesTab');
    const categoriesModal = document.getElementById('categoriesModal');
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const searchInput = document.getElementById('searchInput');
    const eventsContainer = document.getElementById('eventsContainer');

    let selectedCategoryId = '';

    function openModal() {
        categoriesModal.classList.add('active');
        categoriesModal.setAttribute('aria-hidden', 'false');
        categoriesTab.setAttribute('aria-expanded', 'true');
        const firstCard = categoriesModal.querySelector('.event-card');
        if (firstCard) firstCard.focus();
    }

    function closeModal() {
        categoriesModal.classList.remove('active');
        categoriesModal.setAttribute('aria-hidden', 'true');
        categoriesTab.setAttribute('aria-expanded', 'false');
        categoriesTab.focus();
    }

    categoriesTab.addEventListener('click', openModal);
    categoriesTab.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && categoriesModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Загрузка мероприятий с сервера
    function loadEvents(search = '', categoryId = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('category', categoryId);

        fetch('api/events.php?' + params.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                renderEvents(data.data.events);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            eventsContainer.innerHTML = `<p class="error">Ошибка загрузки мероприятий: ${error.message}</p>`;
        });
    }

    // Отрисовка карточек мероприятий
    function renderEvents(events) {
        if (!events.length) {
            eventsContainer.innerHTML = '<p class="no-events">Мероприятия не найдены</p>';
            return;
        }

        eventsContainer.innerHTML = events.map(event => `
            <div class="event-card" tabindex="0">
                <div class="event-header">
                    <span class="event-category">
                        <i class="fas fa-${event.category_icon}"></i>
                        ${event.category_name}
                    </span>
                </div>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <div class="event-meta">
                    <div class="event-date">
                        <i class="far fa-calendar"></i>
                        ${event.formatted_date}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </div>
                </div>
                <div class="event-time-until">
                    <i class="far fa-clock"></i>
                    ${event.time_until}
                </div>
            </div>
        `).join('');
    }

    // Поиск с debounce
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            loadEvents(searchInput.value.trim(), selectedCategoryId);
        }, 300);
    });

    // Обработка выбора категории из модального окна
    categoriesModal.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedCategoryId = card.getAttribute('data-category-id');
            loadEvents(searchInput.value.trim(), selectedCategoryId);
            closeModal();
        });
    });

    // Загрузка всех мероприятий при загрузке страницы
    loadEvents();
});
</script>

</body>
</html>
