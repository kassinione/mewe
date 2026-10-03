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
  const eventsContainer = document.getElementById('eventsContainer');
  const eventDetailModal = document.getElementById('eventDetailModal');
  const eventDetailClose = document.getElementById('eventDetailClose');
  const eventDetailOverlay = document.getElementById('eventDetailOverlay');
  const eventDetailBody = document.getElementById('eventDetailBody');

  let selectedCategoryId = '';
  let currentEvents = [];
  let eventDetail;

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

  async function loadEvents(search = '', categoryId = '') {
    try {
      const data = await fetchEvents(
        page.dataset.eventsUrl,
        search,
        categoryId
      );

      renderEvents(data.events);
    } catch (error) {
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
      () => loadEvents(searchInput.value.trim(), selectedCategoryId),
      300
    );
  });

  categoriesModal.querySelectorAll('.event-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedCategoryId = card.dataset.categoryId;
      loadEvents(searchInput.value.trim(), selectedCategoryId);
      closeCategoriesModal();
    });
  });

  loadEvents();
});
