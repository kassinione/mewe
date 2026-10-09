import { showToast } from "./toast.js";

const EMPTY_TEXT = 'Расскажите о себе';

const avatarImage = document.querySelector('.profile-avatar-image');

if (avatarImage) {
  const hideBrokenAvatar = () => {
    avatarImage.hidden = true;
  };

  avatarImage.addEventListener('error', hideBrokenAvatar);

  if (avatarImage.complete && avatarImage.naturalWidth === 0) {
    hideBrokenAvatar();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('profile-page');
  const text = document.getElementById('aboutText');
  const form = document.getElementById('about-form');
  const editBtn = document.getElementById('aboutEdit');
  const cancelBtn = document.getElementById('aboutCancel');

  if (!form) {
    return;
  }

  const counter = document.getElementById('aboutCounter');
  const textarea = form.elements.about;
  const submitBtn = form.querySelector('[type="submit"]');

  function updateCounter() {
    counter.textContent = `${textarea.value.length} / ${counter.dataset.max}`;
  }

  textarea.addEventListener('input', updateCounter);
  updateCounter();

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
    updateCounter();
  }

  editBtn.addEventListener('click', () => setEditing(true));

  cancelBtn.addEventListener('click', () => {
    textarea.value = text.classList.contains('is-empty') ? '' : text.textContent;
    updateCounter();
    setEditing(false);
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.disabled = true;

    try {
      const response = await fetch(page.dataset.aboutUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ about: textarea.value.trim() })
      });
      const data = await response.json();

      if (response.ok) {
        renderAbout(data.about);
        setEditing(false);
        showToast('Профиль обновлён', 'success');
      } else {
        const message = data?.error || `HTTP error: ${response.status}`;
        console.error(message);
        showToast('Ошибка: ' + message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Сетевая ошибка при отправке формы.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
});
