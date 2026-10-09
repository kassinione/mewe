import { fetchEvents } from './events-api.js';
import { createEventCard, isEventUpcoming } from './event-card.js';
import { initializeEventDetail } from './event-detail.js';
import { showToast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('events-page');
  const categoriesTab = document.getElementById('categoriesTab');
  const categoriesModal = document.getElementById('categoriesModal');
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');
  const searchInput = document.getElementById('searchInput');
  const selectedCategoryFilter = document.getElementById('selectedCategoryFilter');
  const eventsContainer = document.getElementById('eventsContainer');
  const eventDetailModal = document.getElementById('eventDetailModal');
  const eventDetailClose = document.getElementById('eventDetailClose');
  const eventDetailOverlay = document.getElementById('eventDetailOverlay');
  const eventDetailBody = document.getElementById('eventDetailBody');
  const searchClear = document.getElementById('searchClear');
  const categoriesCount = document.getElementById('categoriesCount');
  const categoriesReset = document.getElementById('categoriesReset');
  const categoriesDone = document.getElementById('categoriesDone');
  const resultsBar = document.getElementById('resultsBar');
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const loadMoreBtn = document.getElementById('loadMoreBtn');

  const selectedCategories = new Map();
  let currentEvents = [];
  let eventDetail;
  let eventsRequestVersion = 0;
  let currentPage = 1;
  let lastPage = 1;
  let totalCount = 0;
  let lastQuery = '';
  let lastCategoryIds = [];
  let debounceTimeout;

  function createEmptyState({ icon, title, text, action }) {
    const box = document.createElement('div');
    box.className = 'no-events empty-state';

    const iconWrap = document.createElement('div');
    iconWrap.className = 'empty-state-icon';
    const iconEl = document.createElement('i');
    iconEl.className = `fas ${icon}`;
    iconEl.setAttribute('aria-hidden', 'true');
    iconWrap.append(iconEl);

    const heading = document.createElement('div');
    heading.className = 'empty-state-title';
    heading.textContent = title;

    const description = document.createElement('div');
    description.className = 'empty-state-text';
    description.textContent = text;

    box.append(iconWrap, heading, description);

    if (action) {
      const control = document.createElement(action.href ? 'a' : 'button');
      control.className = 'btn empty-state-btn';
      control.textContent = action.label;
      if (action.href) {
        control.href = action.href;
      } else {
        control.type = 'button';
        control.addEventListener('click', action.onClick);
      }
      box.append(control);
    }

    return box;
  }

  function syncSearchClear() {
    searchClear.hidden = !searchInput.value;
  }

  function resetFilters() {
    clearTimeout(debounceTimeout);
    searchInput.value = '';
    syncSearchClear();
    selectedCategories.clear();
    renderSelectedCategory();
    loadEvents('');
  }

  function updateResultsInfo() {
    resultsBar.hidden = totalCount === 0 || currentEvents.length === 0;
    resultsCount.textContent = `Найдено: ${totalCount}`;
  }

  function updateLoadMore() {
    loadMoreWrap.hidden = currentPage >= lastPage;
  }

  function applyPagination(data, fallbackPage) {
    currentPage = data.pagination?.current_page ?? fallbackPage;
    lastPage = data.pagination?.last_page ?? currentPage;
    totalCount = data.pagination?.total ?? data.events.length;
  }

  function showSkeleton() {
    const placeholders = Array.from({ length: 3 }, () => {
      const item = document.createElement('div');
      item.className = 'event-skeleton';
      item.setAttribute('aria-hidden', 'true');
      return item;
    });
    eventsContainer.replaceChildren(...placeholders);
  }

  function setLoading(isLoading) {
    eventsContainer.classList.toggle('is-loading', isLoading);
    eventsContainer.setAttribute('aria-busy', String(isLoading));
  }

  function renderEvents(events) {
    currentEvents = events.filter(event => isEventUpcoming(event));
    eventsContainer.replaceChildren();
    updateResultsInfo();
    updateLoadMore();

    if (!currentEvents.length) {
      const hasFilters = Boolean(lastQuery) || lastCategoryIds.length > 0;
      eventsContainer.append(createEmptyState(hasFilters
        ? {
          icon: 'fa-magnifying-glass',
          title: 'Ничего не найдено',
          text: 'Попробуйте изменить запрос или убрать фильтры.',
          action: { label: 'Сбросить фильтры', onClick: resetFilters }
        }
        : {
          icon: 'fa-calendar',
          title: 'Пока нет предстоящих мероприятий',
          text: 'Загляните позже или создайте своё.',
          action: page.dataset.createUrl
            ? { label: 'Создать мероприятие', href: page.dataset.createUrl }
            : null
        }));
      return;
    }

    currentEvents.forEach(event => {
      eventsContainer.append(createEventCard(event));
    });
  }

  function appendEvents(events) {
    const known = new Set(currentEvents.map(event => event.id));
    const fresh = events.filter(event => isEventUpcoming(event) && !known.has(event.id));
    currentEvents.push(...fresh);
    fresh.forEach(event => eventsContainer.append(createEventCard(event)));
    updateResultsInfo();
    updateLoadMore();
  }

  async function loadEvents(search = '') {
    const requestVersion = ++eventsRequestVersion;
    lastQuery = search;
    lastCategoryIds = [...selectedCategories.keys()];

    if (eventsContainer.querySelector('.event-card')) {
      setLoading(true);
    } else {
      showSkeleton();
    }

    try {
      const data = await fetchEvents(
        page.dataset.eventsUrl,
        lastQuery,
        lastCategoryIds,
        1
      );

      if (requestVersion !== eventsRequestVersion) return;
      applyPagination(data, 1);
      renderEvents(data.events);
    } catch (error) {
      if (requestVersion !== eventsRequestVersion) return;
      currentEvents = [];
      resultsBar.hidden = true;
      loadMoreWrap.hidden = true;
      eventsContainer.replaceChildren();

      const message = document.createElement('div');
      message.className = 'error';

      const text = document.createElement('p');
      text.textContent = `Ошибка загрузки мероприятий: ${error.message}`;

      const retry = document.createElement('button');
      retry.className = 'btn empty-state-btn';
      retry.type = 'button';
      retry.textContent = 'Повторить';
      retry.addEventListener('click', () => loadEvents(searchInput.value.trim()));

      message.append(text, retry);
      eventsContainer.append(message);
    } finally {
      if (requestVersion === eventsRequestVersion) setLoading(false);
    }
  }

  async function loadMoreEvents() {
    const requestVersion = eventsRequestVersion;
    const label = loadMoreBtn.textContent;
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Загрузка…';

    try {
      const data = await fetchEvents(
        page.dataset.eventsUrl,
        lastQuery,
        lastCategoryIds,
        currentPage + 1
      );

      if (requestVersion !== eventsRequestVersion) return;
      applyPagination(data, currentPage + 1);
      appendEvents(data.events);
    } catch (error) {
      if (requestVersion !== eventsRequestVersion) return;
      showToast(`Ошибка: ${error.message}`, 'error');
    } finally {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = label;
    }
  }

  function openCategoriesModal() {
    categoriesModal.classList.add('active');
    categoriesModal.setAttribute('aria-hidden', 'false');
    categoriesTab.setAttribute('aria-expanded', 'true');
    categoriesModal.querySelector('.event-card')?.focus();
  }

  function closeCategoriesModal() {
    categoriesModal.classList.remove('active');
    categoriesModal.setAttribute('aria-hidden', 'true');
    categoriesTab.setAttribute('aria-expanded', 'false');
    categoriesTab.focus();
  }

  function renderSelectedCategory() {
    selectedCategoryFilter.replaceChildren();
    selectedCategoryFilter.hidden = selectedCategories.size === 0;
    categoriesTab.classList.toggle('active', selectedCategories.size > 0);
    categoriesCount.textContent = String(selectedCategories.size);
    categoriesCount.hidden = selectedCategories.size === 0;
    categoriesReset.disabled = selectedCategories.size === 0;
    categoriesTab.setAttribute(
      'aria-label',
      selectedCategories.size
        ? `Выбор категории, выбрано: ${selectedCategories.size}`
        : 'Выбор категории'
    );

    selectedCategories.forEach((name, id) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'selected-category-chip';
      chip.setAttribute('aria-label', `Убрать категорию: ${name}`);

      const icon = document.createElement('i');
      icon.className = 'fas fa-tag';
      icon.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.textContent = name;

      const removeIcon = document.createElement('i');
      removeIcon.className = 'fas fa-times';
      removeIcon.setAttribute('aria-hidden', 'true');

      chip.append(icon, label, removeIcon);
      chip.addEventListener('click', () => {
        selectedCategories.delete(id);
        updateCategorySelection();
      });
      selectedCategoryFilter.append(chip);
    });

    categoriesModal.querySelectorAll('[data-category-id]').forEach(card => {
      const isSelected = selectedCategories.has(card.dataset.categoryId);
      card.classList.toggle('category-selected', isSelected);
      card.setAttribute('aria-pressed', String(isSelected));
    });
  }

  function updateCategorySelection() {
    renderSelectedCategory();
    loadEvents(searchInput.value.trim());
  }

  eventDetail = initializeEventDetail({
    modal: eventDetailModal,
    closeButton: eventDetailClose,
    overlay: eventDetailOverlay,
    body: eventDetailBody,
    onEventUpdated: updatedEvent => {
      const index = currentEvents.findIndex(item => item.id === updatedEvent.id);
      if (index !== -1) currentEvents[index] = updatedEvent;
      renderEvents(currentEvents);
    },
    onEventDeleted: deletedEvent => {
      totalCount = Math.max(totalCount - 1, 0);
      renderEvents(currentEvents.filter(item => item.id !== deletedEvent.id));
    }
  });

  categoriesTab.addEventListener('click', openCategoriesModal);
  categoriesTab.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCategoriesModal();
    }
  });

  modalClose.addEventListener('click', closeCategoriesModal);
  modalOverlay.addEventListener('click', closeCategoriesModal);
  categoriesModal.addEventListener('click', event => {
    if (event.target === categoriesModal) closeCategoriesModal();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (categoriesModal.classList.contains('active')) closeCategoriesModal();
    if (eventDetailModal.classList.contains('active')) eventDetail.close();
  });

  eventsContainer.addEventListener('click', event => {
    const card = event.target.closest('.event-card');
    if (!card) return;
    const selectedEvent = currentEvents.find(
      currentEvent => String(currentEvent.id) === card.dataset.eventId
    );
    if (selectedEvent) eventDetail.open(selectedEvent);
  });

  searchInput.addEventListener('input', () => {
    syncSearchClear();
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(
      () => loadEvents(searchInput.value.trim()),
      300
    );
  });

  searchInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    clearTimeout(debounceTimeout);
    loadEvents(searchInput.value.trim());
    searchInput.blur();
  });

  searchClear.addEventListener('click', () => {
    clearTimeout(debounceTimeout);
    searchInput.value = '';
    syncSearchClear();
    loadEvents('');
    searchInput.focus();
  });

  categoriesReset.addEventListener('click', () => {
    selectedCategories.clear();
    updateCategorySelection();
  });
  categoriesDone.addEventListener('click', closeCategoriesModal);
  loadMoreBtn.addEventListener('click', loadMoreEvents);

  function toggleCategory(card) {
    const categoryId = card.dataset.categoryId;
    if (selectedCategories.has(categoryId)) {
      selectedCategories.delete(categoryId);
    } else {
      selectedCategories.set(categoryId, card.dataset.categoryName);
    }
    updateCategorySelection();
  }

  categoriesModal.querySelectorAll('.event-card').forEach(card => {
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('click', () => toggleCategory(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleCategory(card);
      }
    });
  });

  renderSelectedCategory();
  loadEvents();
});
