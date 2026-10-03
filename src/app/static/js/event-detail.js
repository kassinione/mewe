import {
  createDurationMetaItem,
  createIcon,
  createMetaItem,
  createOrganizerMetaItem,
  createParticipantsCountMetaItem
} from './event-card.js';
import {
  deleteEvent,
  fetchParticipantStatus,
  joinEvent,
  leaveEvent
} from './events-api.js';
import { showToast } from './toast.js';

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
      participantMeta?.replaceWith(createParticipantsCountMetaItem(event));
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
    date.textContent = event.formatted_date || '';
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
      createParticipantsCountMetaItem(event)
    );
    const organizer = createOrganizerMetaItem(event);
    if (organizer) meta.append(organizer);

    const description = document.createElement('p');
    description.className = 'event-detail-description';
    description.textContent = event.description || 'Описание не указано';

    actionContainer = document.createElement('div');
    actionContainer.className = 'event-detail-actions';
    participantMeta = meta.querySelector('.event-participants-count');

    body.append(header, title, meta, description, actionContainer);
    renderActionButton('Загрузка статуса…', 'event-detail-action-secondary', () => {}, true);
  }

  function renderParticipationActions(status) {
    currentStatus = status;
    actionContainer.replaceChildren();
    updateRegisteredCount(activeEvent, status.registered_count);

    if (status.is_creator) {
      const eventTime = new Date(activeEvent.event_date).getTime();
      if (Number.isFinite(eventTime) && eventTime > Date.now()) {
        renderActionButton('Удалить мероприятие', 'event-detail-action-danger', removeEvent);
      }
      return;
    }

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
