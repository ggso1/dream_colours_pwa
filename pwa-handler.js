let deferredInstallPrompt = null;
const installButton = document.getElementById('installButton');
const statusDiv = document.getElementById('status');

// 1. Обробка події beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    // ВАЖЛИВА ЗМІНА: Видалили e.preventDefault();
    // Це дозволить Chrome показати свій стандартний значок/підказку.

    // Зберігаємо подію, щоб викликати її ПІЗНІШЕ (якщо користувач натисне НАШУ кнопку)
    deferredInstallPrompt = e;

    // Показуємо нашу кастомну кнопку, якщо вона доступна
    if (installButton) {
        installButton.style.display = 'block';
        console.log('Подія beforeinstallprompt збережена. Кнопка показана.');
    }
});

// 2. Обробка натискання кнопки
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            console.log('Подія встановлення не доступна.');
            return;
        }

        // Викликаємо збережену подію, щоб показати системне діалогове вікно
        deferredInstallPrompt.prompt();

        // Чекаємо на відповідь користувача
        const { outcome } = await deferredInstallPrompt.userChoice;
        console.log(`Вибір користувача: ${outcome}`);

        // Після того, як користувач зробив вибір, приховуємо кнопку
        deferredInstallPrompt = null;
        installButton.style.display = 'none';

        if (outcome === 'accepted') {
            console.log('Користувач прийняв запит на встановлення.');
        } else {
            console.log('Користувач відхилив запит на встановлення.');
        }
    });
}


// Реєстрація Service Worker (для офлайн-роботи)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Замініть '/sw.js' на шлях до вашого Service Worker файлу
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker зареєстровано успішно:', registration);
            })
            .catch(error => {
                console.log('Помилка реєстрації Service Worker:', error);
            });
    });
}

// Оновлення статусу підключення
function updateStatus() {
    if (statusDiv) {
        statusDiv.textContent = navigator.onLine ? 'Статус: Онлайн' : 'Статус: Офлайн (з кешу)';
        statusDiv.className = navigator.onLine ? 'online' : 'offline';
    }
}
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
// Викликаємо для початкового стану
updateStatus();