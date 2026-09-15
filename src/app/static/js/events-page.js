import { fetchEvents } from './events-api.js';
import { createEventCard, createIcon, createMetaItem } from './event-card.js';

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

  function setModalState(modal, isOpen) {
    modal.classList.toggle('active', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
  }

  function openCategoriesModal() {
    setModalState(categoriesModal, true);
    categoriesTab.setAttribute('aria-expanded', 'true');
    categoriesModal.querySelector('.event-card')?.focus();
  }

  function closeCategoriesModal() {
    setModalState(categoriesModal, false);
    categoriesTab.setAttribute('aria-expanded', 'false');
    categoriesTab.focus();
  }

  function renderEventDetail(event) {
    eventDetailBody.replaceChildren();

    const header = document.createElement('div');
    header.className = 'event-detail-header';

    const category = document.createElement('div');
    category.className = 'event-category';
    category.append(
      createIcon(`fas ${event.category_icon}`),
      document.createTextNode(event.category_name)
    );

    const date = document.createElement('div');
    date.className = 'event-date';
    date.textContent = event.formatted_date;
    header.append(category, date);

    const title = document.createElement('h2');
    title.id = 'eventDetailTitle';
    title.className = 'event-detail-title';
    title.textContent = event.title;

    const meta = document.createElement('div');
    meta.className = 'event-meta event-detail-meta';
    meta.append(
      createMetaItem('fa-map-marker-alt', event.location),
      createMetaItem(
        'fa-users',
        `${event.registered_count} / ${event.max_participants} участников`
      )
    );

    const description = document.createElement('p');
    description.className = 'event-detail-description';
    description.textContent = event.description || 'Описание не указано';

    eventDetailBody.append(header, title, meta, description);
  }

  function openEventDetail(event) {
    renderEventDetail(event);
    setModalState(eventDetailModal, true);
  }

  function closeEventDetail() {
    setModalState(eventDetailModal, false);
  }

  function renderEvents(events) {
    currentEvents = events;
    eventsContainer.replaceChildren();

    if (!events.length) {
      const message = document.createElement('p');
      message.className = 'no-events';
      message.textContent = 'Мероприятия не найдены';
      eventsContainer.append(message);
      return;
    }

    events.forEach(event => {
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


  categoriesTab.addEventListener('click', openCategoriesModal);
  categoriesTab.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCategoriesModal();
    }
  });

  modalClose.addEventListener('click', closeCategoriesModal);
  modalOverlay.addEventListener('click', closeCategoriesModal);
  eventDetailClose.addEventListener('click', closeEventDetail);
  eventDetailOverlay.addEventListener('click', closeEventDetail);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (categoriesModal.classList.contains('active')) closeCategoriesModal();
    if (eventDetailModal.classList.contains('active')) closeEventDetail();
  });

  eventsContainer.addEventListener('click', event => {
    const card = event.target.closest('.event-card');
    if (!card) return;
    const selectedEvent = currentEvents.find(
      currentEvent => String(currentEvent.id) === card.dataset.eventId
    );
    if (selectedEvent) openEventDetail(selectedEvent);
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
