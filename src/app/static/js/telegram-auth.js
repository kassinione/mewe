import { showToast } from './toast.js';

const tg = window.Telegram?.WebApp


async function authUser() {
    try {
        const response = await fetch("/api/sessions", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                initData: tg?.initData || "",
                platform: tg?.platform || "",
                version: tg?.version || ""
            })
        });
        const result = await response.json();

        if(response.ok) {
            console.log('Auth success:', result.user);
            return true;
        } else {
            console.error(result.error);
            showToast('Ошибка: ' + result.error, 'error');
            return false;
        }
    } catch (err) {
        console.error(err);
        showToast('Сетевая ошибка при попытке аутентификации.', 'error');
        return false;
    }
}

let authPromise = authUser();

// Waits for the session before the request and, if the session
// has been lost (401), signs in again and retries once.
export async function authFetch(url, options = {}) {
    const awaitedAuth = authPromise;
    await awaitedAuth;

    const response = await fetch(url, options);
    if (response.status !== 401) {
        return response;
    }

    // Parallel requests share one re-authentication
    if (authPromise === awaitedAuth) {
        authPromise = authUser();
    }
    if (!(await authPromise)) {
        return response;
    }

    return fetch(url, options);
}
