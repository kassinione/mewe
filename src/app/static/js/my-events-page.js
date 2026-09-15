import { fetchEvents } from './events-api.js';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('my-events-page');
  const eventsContainer = document.getElementById('eventsContainer');
  const eventDetailModal = document.getElementById('eventDetailModal');
  const eventDetailClose = document.getElementById('eventDetailClose');
  const eventDetailOverlay = document.getElementById('eventDetailOverlay');
  const eventDetailBody = document.getElementById('eventDetailBody');
  let currentEvents = [];

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

  function setModalState(modal, isOpen) {
    modal.classList.toggle('active', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
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
        `${event.registered_count || 0} / ${event.max_participants} участников`
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

  function renderMyEvents(events) {
    currentEvents = events;
    eventsContainer.replaceChildren();

    if (!events.length) {
      const message = document.createElement('p');
      message.className = 'no-events';
      message.textContent = 'У вас пока нет мероприятий';
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
          `${event.registered_count || 0} / ${event.max_participants} участников`
        )
      );

      card.append(header, title, meta);
      eventsContainer.append(card);
    });
  }

  eventsContainer.addEventListener('click', event => {
    const card = event.target.closest('.event-card');
    if (!card) return;

    const selectedEvent = currentEvents.find(
      currentEvent => String(currentEvent.id) === card.dataset.eventId
    );
    if (selectedEvent) openEventDetail(selectedEvent);
  });

  eventDetailClose.addEventListener('click', closeEventDetail);
  eventDetailOverlay.addEventListener('click', closeEventDetail);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && eventDetailModal.classList.contains('active')) {
      closeEventDetail();
    }
  });

  async function loadMyEvents() {
    try {
      const data = await fetchEvents(page.dataset.eventsUrl);
      renderMyEvents(data.events);
    } catch (error) {
      const message = document.createElement('p');
      message.className = 'error';
      message.textContent = `Ошибка загрузки мероприятий: ${error.message}`;
      eventsContainer.replaceChildren(message);
    }
  }

  loadMyEvents();
});

let callCreateFormBtn = document.getElementsByClassName("new-event-btn")[0]
let formOverlay = document.getElementById("form-overlay")

callCreateFormBtn.addEventListener("click", () => {
    document.getElementById("my-events-page").classList.add("form-open");
    formOverlay.setAttribute("aria-hidden", "false");
    document.getElementsByClassName("create-hero")[0].style.display = "none";
    document.getElementsByClassName("create-form")[0].style.display = "flex";
});

let closeCreateFormBtn = document.getElementsByClassName("close-btn")[0]

closeCreateFormBtn.addEventListener("click", () => {
    document.getElementById("my-events-page").classList.remove("form-open");
    formOverlay.setAttribute("aria-hidden", "true");
    document.getElementsByClassName("create-form")[0].style.display = "none";
    document.getElementsByClassName("create-hero")[0].style.display = "flex";
});

formOverlay.addEventListener("click", () => {
    closeCreateFormBtn.click();
});
