document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('event-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // ❌ отменяем стандартную отправку

        const formData = new FormData(form);

        try {
            const response = await fetch('/handlers/create-event.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Мероприятие успешно создано!');
                form.reset();
            } else {
                alert('Ошибка: ' + result.message);
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке формы.');
        }
    });
});
