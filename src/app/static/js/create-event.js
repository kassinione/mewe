document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('event-form');
  const msgBox = document.getElementById('form-message');

  function showToast(message, type = '') {
    msgBox.textContent = message;
    msgBox.className = 'form-message show';
    if (type) msgBox.classList.add(type);

    setTimeout(() => {
      msgBox.classList.remove('show');
    }, 2000);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const dateVal = document.getElementById('event-date').value;
    const timeVal = document.getElementById('event-time').value;
    const eventDateTime = new Date(`${dateVal}T${timeVal}`);

    if (eventDateTime <= new Date()) {
      showToast('Дата и время мероприятия должны быть в будущем', 'error');
      return;
    }

    const payload = {
      title: form.title.value.trim(),
      location: form.location.value.trim(),
      description: form.description.value.trim(),
      category: Number(form.category.value),
      max_participants: Number(form.participants.value),
      event_date: `${dateVal}T${timeVal}:00`
    };

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();

      if (result.success) {
        showToast('Мероприятие создано!', 'success');
        form.reset();
        form.style.display = "none";
        document.getElementsByClassName("main")[0].style.display = "flex";
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        showToast('Ошибка: ' + result.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Сетевая ошибка при отправке формы.', 'error');
    }
  });
});