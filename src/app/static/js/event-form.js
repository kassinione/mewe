import { authFetch } from "./telegram-auth.js";
import { showToast } from "./toast.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const counters = [...form.querySelectorAll('[data-counter-for]')];

  function updateCounters() {
    counters.forEach(counter => {
      const field = form.elements[counter.dataset.counterFor];
      counter.textContent = `${field.value.length} / ${field.maxLength}`;
    });
  }

  form.addEventListener('input', updateCounters);
  updateCounters();

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.toggle('invalid', !field.value);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const textFieldsValid = [...form.querySelectorAll('input[maxlength], textarea[maxlength]')]
      .every(field => {
        const valid = field.value.length <= field.maxLength;
        field.classList.toggle('invalid', !valid);
        return valid;
      });

    if (!textFieldsValid) {
      showToast('Превышена допустимая длина текстового поля', 'error');
      return;
    }

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

    const durationMinutes = Number(form.duration_hours.value) * 60
      + Number(form.duration_minutes.value);
    if (
      durationMinutes < Number(form.dataset.minDuration)
      || durationMinutes > Number(form.dataset.maxDuration)
    ) {
      const range = document.getElementById('duration-note').textContent;
      showToast(`Продолжительность должна быть ${range}`, 'error');
      return;
    }

    const payload = {
      title: form.title.value.trim(),
      location: form.location.value.trim(),
      description: form.description.value.trim(),
      category: Number(form.category.value),
      max_participants: Number(form.participants.value),
      duration_minutes: durationMinutes,
      event_date: `${dateVal}T${timeVal}:00`
    };

    try {
      const response = await authFetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        showToast('Мероприятие создано!', 'success');
        form.reset();
        updateCounters();
        document.dispatchEvent(new CustomEvent('close-create-form'));
        setTimeout(() => {
          location.reload();
        }, 2000);
      } else {
        const message = data?.error || `HTTP error: ${response.status}`;
        console.error(message);
        showToast('Ошибка: ' + message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Сетевая ошибка при отправке формы.', 'error');
    }
  });
});
