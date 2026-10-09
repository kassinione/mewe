import { fetchEvents } from './events-api.js';
import { createEventCard, isEventPast } from './event-card.js';
import { initializeEventDetail } from './event-detail.js';

const TAB_STORAGE_KEY = 'myEventsTab';
const TABS = ['participations', 'created'];

function readStoredTab() {
  try {
    return sessionStorage.getItem(TAB_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeTab(name) {
  try {
    sessionStorage.setItem(TAB_STORAGE_KEY, name);
  } catch {
    // хранилище может быть недоступно (приватный режим) — не критично
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('my-events-page');
  const createdContainer = document.getElementById('createdEventsContainer');
  const participationsContainer = document.getElementById('participationsContainer');
  const eventDetailModal = document.getElementById('eventDetailModal');
  const eventDetailClose = document.getElementById('eventDetailClose');
  const eventDetailOverlay = document.getElementById('eventDetailOverlay');
  const eventDetailBody = document.getElementById('eventDetailBody');
  const createdCount = document.getElementById('createdCount');
  const participationsCount = document.getElementById('participationsCount');
  const tabButtons = [...document.querySelectorAll('.my-events-tab')];
  let createdEvents = [];
  let participatingEvents = [];

  const emptyCreated = {
    icon: 'fa-calendar-plus',
    title: 'Вы пока не создали мероприятий',
    text: 'Оно появится в общем списке, и на него смогут записаться другие.',
    action: {
      label: 'Создать мероприятие',
      onClick: () => document.querySelector('.new-event-btn').click()
    }
  };

  const emptyParticipations = {
    icon: 'fa-users',
    title: 'Вы пока не записались на мероприятия',
    text: 'Найдите интересное в общем списке и запишитесь.',
    action: page.dataset.searchUrl
      ? { label: 'Найти мероприятие', href: page.dataset.searchUrl }
      : null
  };

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

  function setCount(badge, count) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  // Возвращает число предстоящих мероприятий (для бейджа на вкладке)
  function renderSection(container, events, empty) {
    container.replaceChildren();
    if (!events.length) {
      container.append(createEmptyState(empty));
      return 0;
    }

    const upcomingEvents = [];
    const pastEvents = [];
    events.forEach(event => {
      (isEventPast(event) ? pastEvents : upcomingEvents).push(event);
    });

    upcomingEvents.forEach(event => container.append(createEventCard(event)));
    if (!upcomingEvents.length) {
      const notice = document.createElement('p');
      notice.className = 'no-events';
      notice.textContent = 'Нет предстоящих мероприятий';
      container.append(notice);
    }
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
    return upcomingEvents.length;
  }

  function renderCreatedEvents() {
    setCount(createdCount, renderSection(createdContainer, createdEvents, emptyCreated));
  }

  function renderParticipations() {
    setCount(participationsCount, renderSection(participationsContainer, participatingEvents, emptyParticipations));
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

  function setTab(name, { focus = false } = {}) {
    tabButtons.forEach(tab => {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus();
    });
    storeTab(name);
  }

  tabButtons.forEach((tab, index) => {
    tab.addEventListener('click', () => setTab(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabButtons[(index + step + tabButtons.length) % tabButtons.length];
      setTab(next.dataset.tab, { focus: true });
    });
  });

  // «Создать» ведёт на «Я организую»: после создания страница перезагружается,
  // и пользователь сразу видит своё мероприятие
  document.querySelector('.new-event-btn').addEventListener('click', () => setTab('created'));

  const storedTab = readStoredTab();
  setTab(TABS.includes(storedTab) ? storedTab : TABS[0]);

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
