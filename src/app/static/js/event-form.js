import { showToast } from "./toast.js";


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.toggle('invalid', !field.value);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const requiredFieldsValid = [...form.querySelectorAll('[required]')]
      .every(field => {
        const valid = Boolean(field.value);
        field.classList.toggle('invalid', !valid);
        return valid;
      });

    if (!requiredFieldsValid) {
      return;
    }

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
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        showToast('Мероприятие создано!', 'success');
        form.reset();
        document.getElementById('my-events-page').classList.remove('form-open');
        document.getElementById('form-overlay').setAttribute('aria-hidden', 'true');
        form.style.display = "none";
        document.getElementsByClassName("create-hero")[0].style.display = "flex";
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        console.error(data.error);
        showToast('Ошибка: ' + data.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Сетевая ошибка при отправке формы.', 'error');
    }
  });
});
