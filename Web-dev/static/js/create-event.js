document.addEventListener('DOMContentLoaded', () => {
  const form   = document.getElementById('event-form');
  const msgBox = document.getElementById('form-message');

  function showToast(message, type = '') {
    // подготовка текста и типа
    msgBox.textContent = message;
    msgBox.className = 'form-message show';
    if (type) msgBox.classList.add(type);

    // через 3 секунды начинаем скрывать (opacity: 1→0)
    setTimeout(() => {
      msgBox.classList.remove('show');
    }, 3000);
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);

    try {
      const res    = await fetch(form.action, { method: 'POST', body: data });
      const result = await res.json();

      if (result.success) {
        showToast('Мероприятие создано!', 'success');
        form.reset();
        form.style.display = "none";
        document.getElementsByClassName("main")[0].style.display = "flex";
      } else {
        showToast('Ошибка: ' + result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Сетевая ошибка при отправке формы.', 'error');
    }
  });
});
