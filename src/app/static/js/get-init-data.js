import { showToast } from './toast.js';

const tg = window.Telegram?.WebApp


async function authUser() {
    try {
        const response = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData: tg?.initData || ""})
        });
        const result = await response.json();

        if(result.success) {
            console.log('Auth success:', result.user);
        } else {
            console.error(result.error);
            showToast('Ошибка: ' + result.error, 'error');
        } 
    } catch (err) {
        console.error(err);
        showToast('Сетевая ошибка при попытке аутентификации.', 'error');
    }
}