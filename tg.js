const token = '8527145334:AAGtkDF0Ek6FNjqQW73nn1T_NTIDE5Fzki0';
// ВИПРАВЛЕНО: Chat ID ГРУПИ ПОВИНЕН БУТИ З МІНУСОМ
const chatId = '-4997547012';

// DOM елементи
const feedbackInput = document.getElementById('feedback');
const sendBtn = document.querySelector('.sendtg-btn');
const feedbackSent = document.getElementById('feedback-sent'); // Статус надсилання

// URL для запиту до API для отримання кількості учасників
const url = `https://api.telegram.org/bot${token}/getChatMembersCount?chat_id=${chatId}`;


// ... (Функції checkBotAndChat та getPeopleCount залишаються без змін) ...
// ... (Обробник window.onload залишається без змін) ...


// Обробник для відправки коментаря через Telegram-бота
sendBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const textToSend = feedbackInput.value.trim() || feedbackInput.placeholder;

    if (!textToSend) {
        feedbackSent.textContent = 'Будь ласка, введіть текст повідомлення';
        feedbackSent.classList.remove('hidden');
        return;
    }

    const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    // ВИПРАВЛЕНО: Прибираємо @. Використовуємо коректний chatId (з мінусом)
    const params = {
        chat_id: chatId,
        text: textToSend,
        parse_mode: 'HTML'
    };

    // Відправка повідомлення через Telegram API
    fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    // Логуємо деталі помилки від Telegram
                    console.error("Telegram API Error Details:", err);
                    throw new Error(`Telegram API Error: ${err.description || response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.ok) {
                feedbackInput.value = '';
                feedbackSent.textContent = 'Успішно надіслано!';
                feedbackSent.classList.remove('hidden');
            } else {
                console.error("Помилка надсилання:", data);
                feedbackSent.textContent = 'Не вдалося надіслати.';
                feedbackSent.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error("Помилка надсилання:", error);
            feedbackSent.textContent = 'Виникла помилка при надсиланні.';
            feedbackSent.classList.remove('hidden');
        });
});

// Очищення повідомлення про статус при кліку на поле вводу
feedbackInput.addEventListener('click', () => {
    feedbackSent.textContent = '';
});