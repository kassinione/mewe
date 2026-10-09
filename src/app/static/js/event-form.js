import { showToast } from "./toast.js";

const MIN_DURATION_MINUTES = 15;
const MAX_DURATION_MINUTES = 1440;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('event-form');
  const submitBtn = form.querySelector('[type="submit"]');
  const hoursInput = form.elements.duration_hours;
  const minutesInput = form.elements.duration_minutes;
  const chips = [...form.querySelectorAll('.duration-chip')];
  const counters = [...form.querySelectorAll('[data-counter-for]')]
    .map(el => ({ el, field: form.elements[el.dataset.counterFor] }));

  const isTextField = field => field.tagName === 'TEXTAREA' || field.type === 'text';

  function isFieldValid(field) {
    if (isTextField(field)) return field.value.trim() !== '';
    return field.checkValidity();
  }

  function setInvalid(field, invalid) {
    field.classList.toggle('invalid', invalid);
    field.setAttribute('aria-invalid', String(invalid));
  }

  function updateCounters() {
    counters.forEach(({ el, field }) => {
      const length = field.value.length;
      el.textContent = `${length} / ${field.maxLength}`;
      el.classList.toggle('is-near', length >= field.maxLength * 0.9);
    });
  }

  function currentDuration() {
    return Number(hoursInput.value) * 60 + Number(minutesInput.value);
  }

  function syncPresets() {
    const total = currentDuration();
    chips.forEach(chip => {
      const active = Number(chip.dataset.minutes) === total;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const total = Number(chip.dataset.minutes);
      hoursInput.value = Math.floor(total / 60);
      minutesInput.value = total % 60;
      setInvalid(hoursInput, false);
      setInvalid(minutesInput, false);
      syncPresets();
    });
  });

  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('input', () => {
      // Снимаем подсветку, как только поле исправлено;
      // ставим сразу только если поле очищено (не мешаем набирать число)
      if (isFieldValid(field)) {
        setInvalid(field, false);
      } else if (!field.value.trim()) {
        setInvalid(field, true);
      }
    });
  });

  form.addEventListener('input', () => {
    updateCounters();
    syncPresets();
  });

  form.addEventListener('reset', () => {
    // значения сбрасываются после события, поэтому обновляем в следующем тике
    setTimeout(() => {
      form.querySelectorAll('.invalid').forEach(field => setInvalid(field, false));
      updateCounters();
      syncPresets();
    });
  });

  function focusFirstInvalid() {
    const first = form.querySelector('.invalid');
    if (!first) return;
    first.focus({ preventScroll: true });
    first.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function fail(message) {
    showToast(message, 'error');
    focusFirstInvalid();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const textFieldsValid = [...form.querySelectorAll('input[maxlength], textarea[maxlength]')]
      .map(field => {
        const valid = field.value.length <= field.maxLength;
        if (!valid) setInvalid(field, true);
        return valid;
      })
      .every(Boolean);

    if (!textFieldsValid) {
      fail('Превышена допустимая длина текстового поля');
      return;
    }

    // Нативную проверку отключает novalidate, поэтому проверяем сами:
    // обязательность, пробелы, диапазоны (участники, часы, минуты, дата)
    const requiredFieldsValid = [...form.querySelectorAll('[required]')]
      .map(field => {
        const valid = isFieldValid(field);
        setInvalid(field, !valid);
        return valid;
      })
      .every(Boolean);

    if (!requiredFieldsValid) {
      fail('Проверьте выделенные поля');
      return;
    }

    const dateVal = form.elements.date.value;
    const timeVal = form.elements.time.value;
    const eventDateTime = new Date(`${dateVal}T${timeVal}`);

    if (eventDateTime <= new Date()) {
      setInvalid(form.elements.date, true);
      setInvalid(form.elements.time, true);
      fail('Дата и время мероприятия должны быть в будущем');
      return;
    }

    const durationMinutes = currentDuration();
    if (durationMinutes < MIN_DURATION_MINUTES || durationMinutes > MAX_DURATION_MINUTES) {
      setInvalid(hoursInput, true);
      setInvalid(minutesInput, true);
      fail('Продолжительность должна быть от 00:15 до 24:00');
      return;
    }

    const payload = {
      title: form.elements.title.value.trim(),
      location: form.elements.location.value.trim(),
      description: form.elements.description.value.trim(),
      category: Number(form.elements.category.value),
      max_participants: Number(form.elements.participants.value),
      duration_minutes: durationMinutes,
      event_date: `${dateVal}T${timeVal}:00`
    };

    // Защита от двойной отправки (лимит создания — одно мероприятие в 5 минут)
    const submitLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Создаём…';
    let created = false;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        created = true;
        showToast('Мероприятие создано!', 'success');
        form.reset();
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
    } finally {
      // после успеха кнопка остаётся заблокированной до перезагрузки страницы
      if (!created) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitLabel;
      }
    }
  });

  updateCounters();
  syncPresets();
});
