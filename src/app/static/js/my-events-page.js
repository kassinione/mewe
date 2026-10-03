import { fetchEvents } from './events-api.js';
import { createEventCard } from './event-card.js';
import { initializeEventDetail } from './event-detail.js';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('my-events-page');
  const createdContainer = document.getElementById('createdEventsContainer');
  const participationsContainer = document.getElementById('participationsContainer');
  const eventDetailModal = document.getElementById('eventDetailModal');
  const eventDetailClose = document.getElementById('eventDetailClose');
  const eventDetailOverlay = document.getElementById('eventDetailOverlay');
  const eventDetailBody = document.getElementById('eventDetailBody');
  let createdEvents = [];
  let participatingEvents = [];

  function renderSection(container, events, emptyMessage) {
    container.replaceChildren();
    if (!events.length) {
      const message = document.createElement('p');
      message.className = 'no-events';
      message.textContent = emptyMessage;
      container.append(message);
      return;
    }

    const now = Date.now();
    const upcomingEvents = [];
    const pastEvents = [];
    events.forEach(event => {
      const eventTime = new Date(event.event_date).getTime();
      (Number.isFinite(eventTime) && eventTime <= now ? pastEvents : upcomingEvents)
        .push(event);
    });

    upcomingEvents.forEach(event => container.append(createEventCard(event)));
    if (pastEvents.length) {
      const details = document.createElement('details');
      details.className = 'past-events';

      const summary = document.createElement('summary');
      summary.textContent = `Прошедшие мероприятия (${pastEvents.length})`;

      const pastContainer = document.createElement('div');
      pastContainer.className = 'events-container past-events-container';
      pastEvents.forEach(event => pastContainer.append(createEventCard(event)));

      details.append(summary, pastContainer);
      container.append(details);
    }
  }

  function renderCreatedEvents() {
    renderSection(createdContainer, createdEvents, 'Вы пока не создали мероприятий');
  }

  function renderParticipations() {
    renderSection(participationsContainer, participatingEvents, 'Вы пока не записались на мероприятия');
  }

  async function loadCreatedEvents() {
    try {
      const data = await fetchEvents(page.dataset.eventsUrl);
      createdEvents = data.events;
      renderCreatedEvents();
    } catch (error) {
      createdContainer.replaceChildren();
      const message = document.createElement('p');
      message.className = 'error';
      message.textContent = `Ошибка загрузки мероприятий: ${error.message}`;
      createdContainer.append(message);
    }
  }

  async function loadParticipations() {
    try {
      const data = await fetchEvents(page.dataset.participationsUrl);
      participatingEvents = data.events;
      renderParticipations();
    } catch (error) {
      participationsContainer.replaceChildren();
      const message = document.createElement('p');
      message.className = 'error';
      message.textContent = `Ошибка загрузки записей: ${error.message}`;
      participationsContainer.append(message);
    }
  }

  const eventDetail = initializeEventDetail({
    modal: eventDetailModal,
    closeButton: eventDetailClose,
    overlay: eventDetailOverlay,
    body: eventDetailBody,
    onEventUpdated: updatedEvent => {
      [createdEvents, participatingEvents].forEach(events => {
        const matchingEvent = events.find(item => item.id === updatedEvent.id);
        if (matchingEvent) matchingEvent.registered_count = updatedEvent.registered_count;
      });
      renderCreatedEvents();
      renderParticipations();
    },
    onEventDeleted: deletedEvent => {
      createdEvents = createdEvents.filter(item => item.id !== deletedEvent.id);
      participatingEvents = participatingEvents.filter(item => item.id !== deletedEvent.id);
      renderCreatedEvents();
      renderParticipations();
    },
    onParticipationChanged: loadParticipations
  });

  function openSelectedEvent(event) {
    const card = event.target.closest('.event-card');
    if (!card) return;

    const events = card.closest('#createdEventsContainer')
      ? createdEvents
      : participatingEvents;
    const selectedEvent = events.find(item => String(item.id) === card.dataset.eventId);
    if (selectedEvent) eventDetail.open(selectedEvent);
  }

  createdContainer.addEventListener('click', openSelectedEvent);
  participationsContainer.addEventListener('click', openSelectedEvent);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && eventDetailModal.classList.contains('active')) {
      eventDetail.close();
    }
  });

  loadCreatedEvents();
  loadParticipations();
});

const myEventsPage = document.getElementById('my-events-page');
const callCreateFormBtn = document.getElementsByClassName('new-event-btn')[0];
const formOverlay = document.getElementById('form-overlay');
const createHero = document.getElementsByClassName('create-hero')[0];
const createForm = document.getElementsByClassName('create-form')[0];
const closeCreateFormBtn = document.getElementsByClassName('close-btn')[0];
let closeFormTimeout;

callCreateFormBtn.addEventListener('click', () => {
  clearTimeout(closeFormTimeout);
  myEventsPage.classList.add('form-open');
  createForm.classList.remove('form-closing');
  formOverlay.setAttribute('aria-hidden', 'false');
  formOverlay.classList.add('form-open');
  createHero.style.display = 'none';
  createForm.style.display = 'flex';
});

function closeCreateForm() {
  if (!myEventsPage.classList.contains('form-open')) return;
  createForm.classList.add('form-closing');
  formOverlay.classList.remove('form-open');
  formOverlay.setAttribute('aria-hidden', 'true');
  closeFormTimeout = setTimeout(() => {
    myEventsPage.classList.remove('form-open');
    createForm.classList.remove('form-closing');
    createForm.style.display = 'none';
    createHero.style.display = 'flex';
  }, 300);
}

closeCreateFormBtn.addEventListener('click', closeCreateForm);
formOverlay.addEventListener('click', event => {
  if (event.target === formOverlay) closeCreateForm();
});
document.addEventListener('close-create-form', closeCreateForm);
