import {
  createDurationMetaItem,
  createIcon,
  createMetaItem,
  createParticipantsItem,
  formatEventDate,
  isEventUpcoming
} from './event-card.js';
import {
  deleteEvent,
  fetchParticipantStatus,
  joinEvent,
  leaveEvent
} from './events-api.js';
import { showToast } from './toast.js';

function createOrganizerText(event) {
  const fragment = document.createDocumentFragment();

  if (event.creator_name) {
    const name = document.createElement('span');
    name.className = 'organizer-name';
    name.textContent = event.creator_name;
    fragment.append(name);
  }

  if (event.creator_username) {
    const username = document.createElement('span');
    username.className = 'organizer-username';
    username.textContent = `@${event.creator_username}`;
    fragment.append(username);
  }

  return fragment;
}

function createOrganizerMetaItem(event) {
  if (!event.creator_name && !event.creator_username) return null;

  const item = document.createElement('div');
  item.className = 'meta-item event-organizer-meta';
  item.append(createIcon('fas fa-user icon'));

  if (event.creator_id !== null && event.creator_id !== undefined) {
    const link = document.createElement('a');
    link.className = 'event-organizer-profile-link';
    link.href = `/${encodeURIComponent(String(event.creator_id))}/profile`;
    link.append(createOrganizerText(event));
    item.append(link);
  } else {
    const text = document.createElement('span');
    text.className = 'event-organizer-text';
    text.append(createOrganizerText(event));
    item.append(text);
  }

  return item;
}

// Тот же блок участников, что и в карточке (счётчик, статус, полоса),
// но с классом-хуком для обновления после записи/отмены.
function createDetailParticipants(event) {
  const item = createParticipantsItem(event);
  item.classList.add('event-participants-count');
  return item;
}

export function initializeEventDetail({
  modal,
  closeButton,
  overlay,
  body,
  onEventUpdated = () => {},
  onEventDeleted = () => {},
  onParticipationChanged = () => {}
}) {
  let activeEvent = null;
  let actionContainer = null;
  let participantMeta = null;
  let currentStatus = null;
  let requestVersion = 0;

  function setModalState(isOpen) {
    modal.classList.toggle('active', isOpen);
    modal.setAttribute('aria-hidden', String(!isOpen));
  }

  function renderActionButton(label, className, handler, disabled = false) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn event-detail-action ${className}`;
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener('click', handler);
    actionContainer.append(button);
    return button;
  }

  function updateRegisteredCount(event, count) {
    const changed = event.registered_count !== count;
    event.registered_count = count;
    if (activeEvent === event) {
      participantMeta?.replaceWith(createDetailParticipants(event));
      participantMeta = body.querySelector('.event-participants-count');
    }
    if (changed) onEventUpdated(event);
  }

  function renderDetail(event) {
    body.replaceChildren();

    const header = document.createElement('div');
    header.className = 'event-detail-header';

    const category = document.createElement('div');
    category.className = 'event-category';
    if (event.category_icon) category.append(createIcon(`fas ${event.category_icon}`));
    category.append(document.createTextNode(event.category_name || 'Без категории'));

    const date = document.createElement('div');
    date.className = 'event-date';
    date.textContent = formatEventDate(event) || '';
    header.append(category, date);

    const title = document.createElement('h2');
    title.id = 'eventDetailTitle';
    title.className = 'event-detail-title';
    title.textContent = event.title;

    const meta = document.createElement('div');
    meta.className = 'event-meta event-detail-meta';
    meta.append(
      createMetaItem('fa-map-marker-alt', event.location),
      createDurationMetaItem(event),
      createDetailParticipants(event)
    );
    const organizer = createOrganizerMetaItem(event);
    if (organizer) meta.append(organizer);

    const about = document.createElement('div');
    about.className = 'event-detail-about';

    const aboutLabel = document.createElement('div');
    aboutLabel.className = 'event-detail-section-label';
    aboutLabel.textContent = 'Описание';

    const description = document.createElement('p');
    description.className = 'event-detail-description';
    description.textContent = event.description || 'Описание не указано';
    about.append(aboutLabel, description);

    actionContainer = document.createElement('div');
    actionContainer.className = 'event-detail-actions';
    participantMeta = meta.querySelector('.event-participants-count');

    body.append(header, title, meta, about, actionContainer);
    renderActionButton('Загрузка статуса…', 'event-detail-action-secondary', () => {}, true);
  }

  function renderParticipationActions(status) {
    currentStatus = status;
    actionContainer.replaceChildren();
    updateRegisteredCount(activeEvent, status.registered_count);
    const isUpcoming = isEventUpcoming(activeEvent);

    if (status.is_creator) {
      if (isUpcoming) {
        renderActionButton('Удалить мероприятие', 'event-detail-action-danger', removeEvent);
      }
      return;
    }

    if (!isUpcoming && !status.is_registered) return;

    renderActionButton(
      status.is_registered ? 'Отменить запись' : 'Записаться',
      status.is_registered ? 'event-detail-action-secondary' : 'event-detail-action-primary',
      changeParticipation
    );
  }

  function setActionDisabled(disabled, label) {
    const button = actionContainer.querySelector('button');
    if (!button) return;
    button.disabled = disabled;
    if (label) button.textContent = label;
  }

  async function loadStatus(event, version) {
    try {
      const status = await fetchParticipantStatus(event.id);
      if (version !== requestVersion || activeEvent !== event) return;
      renderParticipationActions(status);
    } catch (error) {
      if (version !== requestVersion || activeEvent !== event) return;
      actionContainer.replaceChildren();
      const notice = document.createElement('p');
      notice.className = 'event-detail-notice event-detail-error';
      notice.textContent = `Не удалось загрузить статус участия: ${error.message}`;
      actionContainer.append(notice);
    }
  }

  async function changeParticipation() {
    if (!activeEvent || !currentStatus) return;
    const event = activeEvent;
    const wasRegistered = currentStatus.is_registered;
    setActionDisabled(true, wasRegistered ? 'Отмена записи…' : 'Запись…');

    try {
      if (wasRegistered) {
        const result = await leaveEvent(event.id);
        updateRegisteredCount(
          event,
          result?.registered_count ?? Math.max((event.registered_count || 0) - 1, 0)
        );
        showToast('Запись отменена', 'success');
      } else {
        const result = await joinEvent(event.id);
        updateRegisteredCount(event, result.registered_count);
        showToast('Вы записаны на мероприятие', 'success');
      }
      if (activeEvent === event) {
        renderParticipationActions({
          ...currentStatus,
          is_registered: !wasRegistered,
          registered_count: event.registered_count
        });
      }
      onParticipationChanged(event, !wasRegistered);
    } catch (error) {
      showToast(`Ошибка: ${error.message}`, 'error');
      if (activeEvent === event) {
        try {
          const status = await fetchParticipantStatus(event.id);
          if (activeEvent === event) renderParticipationActions(status);
        } catch (statusError) {
          if (activeEvent === event) {
            actionContainer.replaceChildren();
            const notice = document.createElement('p');
            notice.className = 'event-detail-notice event-detail-error';
            notice.textContent = `Не удалось обновить статус: ${statusError.message}`;
            actionContainer.append(notice);
          }
        }
      }
    }
  }

  async function removeEvent() {
    if (!activeEvent || !window.confirm('Удалить это мероприятие? Все записи участников также будут удалены.')) {
      return;
    }

    const event = activeEvent;
    setActionDisabled(true, 'Удаление…');
    try {
      await deleteEvent(event.id);
      setModalState(false);
      activeEvent = null;
      requestVersion += 1;
      onEventDeleted(event);
      showToast('Мероприятие удалено', 'success');
    } catch (error) {
      showToast(`Ошибка: ${error.message}`, 'error');
      if (activeEvent === event) {
        try {
          const status = await fetchParticipantStatus(event.id);
          if (activeEvent === event) renderParticipationActions(status);
        } catch (statusError) {
          if (activeEvent === event) {
            actionContainer.replaceChildren();
            const notice = document.createElement('p');
            notice.className = 'event-detail-notice event-detail-error';
            notice.textContent = `Не удалось обновить статус: ${statusError.message}`;
            actionContainer.append(notice);
          }
        }
      }
    }
  }

  function open(event) {
    activeEvent = event;
    currentStatus = null;
    const version = ++requestVersion;
    renderDetail(event);
    setModalState(true);
    loadStatus(event, version);
  }

  function close() {
    setModalState(false);
    activeEvent = null;
    currentStatus = null;
    requestVersion += 1;
  }

  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', close);
  modal.addEventListener('click', event => {
    if (event.target === modal) close();
  });

  return { open, close };
}
