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

  function createIcon(className) {
    const icon = document.createElement('i');
    icon.className = className;
    return icon;
  }

  function createMetaItem(iconClass, text) {
    const item = document.createElement('div');
    item.className = 'meta-item';
    item.append(createIcon(`fas ${iconClass} icon`), document.createTextNode(text));
    return item;
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
      const card = document.createElement('div');
      card.className = 'event-card';
      card.dataset.eventId = event.id;
      card.tabIndex = 0;

      const header = document.createElement('div');
      header.className = 'event-header';

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

      const title = document.createElement('h3');
      title.className = 'event-title';
      title.textContent = event.title;

      const meta = document.createElement('div');
      meta.className = 'event-meta';
      meta.append(
        createMetaItem('fa-map-marker-alt', event.location),
        createMetaItem(
          'fa-users',
          `${event.registered_count} / ${event.max_participants} участников`
        )
      );

      card.append(header, title, meta);
      eventsContainer.append(card);
    });
  }

  async function loadEvents(search = '', categoryId = '') {
    const url = new URL(page.dataset.eventsUrl, window.location.origin);
    if (search) url.searchParams.set('search', search);
    if (categoryId) url.searchParams.set('category', categoryId);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' }
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unknown error');
      }
      renderEvents(data.data.events);
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
