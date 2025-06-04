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
        // Фокус на первую карточку
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
    categoriesTab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && categoriesModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Функция загрузки мероприятий (пример, можно вынести в глобальную область)
    function loadEvents(search = '', categoryId = '') {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (categoryId) params.append('category', categoryId);

        fetch('/api/events.php?' + params.toString())
            .then(res => res.json())
            .then(data => {
                if (!data.length) {
                    eventsContainer.innerHTML = '<p class="no-events">Мероприятия не найдены</p>';
                    return;
                }
                eventsContainer.innerHTML = data.map(event => `
                    <div class="event-card" tabindex="0">
                        <div class="event-header">
                            <span class="event-category">${event.category_name}</span>
                            <span class="event-date">${new Date(event.event_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <h3>${event.title}</h3>
                        <div class="event-meta">
                            <span>Место: ${event.place}</span>
                        </div>
                    </div>
                `).join('');
            })
            .catch(() => {
                eventsContainer.innerHTML = '<p class="error">Ошибка загрузки мероприятий</p>';
            });
    }

    categoriesModal.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            selectedCategoryId = card.getAttribute('data-category-id');
            // Загружаем мероприятия по выбранной категории и текущему поиску
            loadEvents(searchInput.value.trim(), selectedCategoryId);
            closeModal();
        });
    });

    // Начальная загрузка всех мероприятий
    loadEvents();
});
