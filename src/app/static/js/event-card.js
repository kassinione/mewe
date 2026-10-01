export function createIcon(className) {
  const icon = document.createElement('i');
  icon.className = className;
  return icon;
}

export function createMetaItem(iconClass, text) {
  const item = document.createElement('div');
  item.className = 'meta-item';
  item.append(createIcon(`fas ${iconClass} icon`), document.createTextNode(text));
  return item;
}

export function createParticipantsCountMetaItem(event) {
  const item = createMetaItem(
    'fa-users',
    `${event.registered_count || 0} / ${event.max_participants} участников`
  );
  item.classList.add('event-participants-count');
  return item;
}

export function createOrganizerMetaItem(event) {
  if (!event.creator_name && !event.creator_username) return null;

  const parts = [event.creator_name, event.creator_username && `@${event.creator_username}`]
    .filter(Boolean);
  const item = createMetaItem('fa-user', parts.join(' '));
  item.classList.add('event-organizer-meta');
  return item;
}

const DAY_MS = 86400000;

export function formatEventDate(event) {
  // Нужен сырой ISO в event.event_date. Если бэкенд его не отдаёт — fallback.
  if (!event.event_date) return event.formatted_date;

  const d = new Date(event.event_date);
  if (Number.isNaN(d.getTime())) return event.formatted_date;

  const now = new Date();
  const dayDiff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()) -
      new Date(now.getFullYear(), now.getMonth(), now.getDate())) / DAY_MS
  );

  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (dayDiff === 0) return `Сегодня, ${time}`;
  if (dayDiff === 1) return `Завтра, ${time}`;

  const opts = { day: 'numeric', month: 'short', weekday: 'short' };
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  return `${d.toLocaleDateString('ru-RU', opts)}, ${time}`;
}

function pluralSpots(n) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `еще ${n} место`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `еще ${n} места`;
  return `еще ${n} мест`;
}

export function createParticipantsItem(event) {
  const registered = event.registered_count || 0;
  const max = event.max_participants;
  const left = Math.max(max - registered, 0);
  const full = left === 0;

  const item = document.createElement('div');
  item.className = 'event-participants';

  const row = document.createElement('div');
  row.className = 'meta-item';

  const status = document.createElement('span');
  status.className = 'participants-status' + (full ? ' full' : '');
  status.textContent = full ? 'мест нет' : pluralSpots(left);

  row.append(
    createIcon('fas fa-users icon'),
    document.createTextNode(`${registered} / ${max}`),
    status
  );

  const bar = document.createElement('div');
  bar.className = 'participants-bar';

  const fill = document.createElement('div');
  fill.className = 'participants-bar-fill' + (full ? ' full' : '');
  fill.style.width = `${max ? Math.min(registered / max, 1) * 100 : 0}%`;
  bar.append(fill);

  item.append(row, bar);
  return item;
}

export function createOrganizerLine(event) {
  if (!event.creator_name && !event.creator_username) return null;

  const line = document.createElement('div');
  line.className = 'event-organizer';
  line.textContent = [
    event.creator_name,
    event.creator_username && `@${event.creator_username}`
  ].filter(Boolean).join(' ');
  return line;
}

export function createEventCard(event) {
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
  date.textContent = formatEventDate(event);
  header.append(category, date);

  const title = document.createElement('h3');
  title.className = 'event-title';
  title.textContent = event.title;

  const meta = document.createElement('div');
  meta.className = 'event-meta';
  meta.append(
    createMetaItem('fa-map-marker-alt', event.location),
    createParticipantsItem(event)
  );

  card.append(header, title, meta);

  const organizer = createOrganizerLine(event);
  if (organizer) card.append(organizer);

  return card;
}
