export function showToast(message, type = '') {
  const toast = document.getElementById('toast');  
  
  if (!toast) {
    console.warn('Элемент для уведомлений не найден');
    return;
  }

  toast.textContent = message;
  
  toast.className = 'toast show';
  
  if (type) toast.classList.add(type);

  setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }