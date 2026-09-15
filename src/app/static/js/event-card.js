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
  return card;
}
