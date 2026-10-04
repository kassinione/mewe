import { fetchEvents } from './events-api.js';
import { createEventCard, isEventUpcoming } from './event-card.js';
import { initializeEventDetail } from './event-detail.js';

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

  const selectedCategories = new Map();
  let currentEvents = [];
  let eventDetail;
  let eventsRequestVersion = 0;

  function renderEvents(events) {
    currentEvents = events.filter(event => isEventUpcoming(event));
    eventsContainer.replaceChildren();

    if (!currentEvents.length) {
      const message = document.createElement('p');
      message.className = 'no-events';
      message.textContent = 'Мероприятия не найдены';
      eventsContainer.append(message);
      return;
    }

    currentEvents.forEach(event => {
      eventsContainer.append(createEventCard(event));
    });
  }

  async function loadEvents(search = '') {
    const requestVersion = ++eventsRequestVersion;
    try {
      const data = await fetchEvents(
        page.dataset.eventsUrl,
        search,
        [...selectedCategories.keys()]
      );

      if (requestVersion !== eventsRequestVersion) return;
      renderEvents(data.events);
    } catch (error) {
      if (requestVersion !== eventsRequestVersion) return;
      eventsContainer.replaceChildren();

      const message = document.createElement('p');
      message.className = 'error';
      message.textContent = `Ошибка загрузки мероприятий: ${error.message}`;
      eventsContainer.append(message);
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

  let debounceTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(
      () => loadEvents(searchInput.value.trim()),
      300
    );
  });

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
