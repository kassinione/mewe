import { fetchEvents } from './events-api.js';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('my-events-page');
  const eventsContainer = document.getElementById('eventsContainer');

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

  function renderMyEvents(events) {
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

callCreateFormBtn.addEventListener("click", () => {
    document.getElementsByClassName("create-hero")[0].style.display = "none";
    document.getElementsByClassName("create-form")[0].style.display = "flex";
});

let closeCreateFormBtn = document.getElementsByClassName("close-btn")[0]

closeCreateFormBtn.addEventListener("click", () => {
    document.getElementsByClassName("create-form")[0].style.display = "none";
    document.getElementsByClassName("create-hero")[0].style.display = "flex";
});
