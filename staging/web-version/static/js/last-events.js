//для оценок

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.expand();
        Telegram.WebApp.enableClosingConfirmation();
    }

    // Обработка звезд рейтинга
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            const eventCard = this.closest('.event-card');
            const eventId = eventCard.getAttribute('data-event-id');
            const stars = eventCard.querySelectorAll('.star');
            
            // Обновление отображения звезд
            stars.forEach((star, index) => {
                if (index < value) {
                    star.textContent = '★';
                    star.classList.add('active');
                } else {
                    star.textContent = '☆';
                    star.classList.remove('active');
                }
            });
            
            // Отправка оценки на сервер
            sendRating(eventId, value);
        });
    });
});

function sendRating(eventId, rating) {
    // Подготовка данных для отправки
    const data = {
        event_id: eventId,
        rating: rating
    };
    
    // Если в Telegram WebApp, добавляем данные пользователя
    if (window.Telegram && Telegram.WebApp.initDataUnsafe.user) {
        data.user_id = Telegram.WebApp.initDataUnsafe.user.id;
    }
    
    // Отправка на сервер
    fetch('api/rate-event.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Спасибо за вашу оценку!');
        } else {
            showNotification('Ошибка при сохранении оценки');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Ошибка соединения');
    });
}

function showNotification(message) {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.showAlert(message);
    } else {
        alert(message);
    }
}