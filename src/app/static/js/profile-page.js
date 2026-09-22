import { showToast } from "./toast.js";

const EMPTY_TEXT = 'Расскажите о себе';

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('profile-page');
  const text = document.getElementById('aboutText');
  const form = document.getElementById('about-form');
  const editBtn = document.getElementById('aboutEdit');
  const cancelBtn = document.getElementById('aboutCancel');
  const textarea = form.elements.about;
  const submitBtn = form.querySelector('[type="submit"]');

  function setEditing(editing) {
    form.hidden = !editing;
    text.hidden = editing;
    editBtn.hidden = editing;
    if (editing) {
      textarea.focus();
    }
  }

  function renderAbout(about) {
    text.textContent = about || EMPTY_TEXT;
    text.classList.toggle('is-empty', !about);
    textarea.value = about || '';
  }

  editBtn.addEventListener('click', () => setEditing(true));

  cancelBtn.addEventListener('click', () => {
    textarea.value = text.classList.contains('is-empty') ? '' : text.textContent;
    setEditing(false);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.disabled = true;

    try {
      const response = await fetch(page.dataset.aboutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about: textarea.value.trim() })
      });
      const data = await response.json();

      if (data.success) {
        renderAbout(data.about);
        setEditing(false);
        showToast('Профиль обновлён', 'success');
      } else {
        console.error(data.error);
        showToast('Ошибка: ' + data.error, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Сетевая ошибка при отправке формы.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
