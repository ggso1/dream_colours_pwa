// Ваш токен для бота
const token = '8239503387:AAF9hEBorjSCzy22C4CWVWC8lhcBUQvhNEM';
// ID чату або групи (має починатися з -100 для груп)
const chatId = '-8239503387'; // Example format, replace with your actual group chat ID
const feedbackSent = document.getElementById('feedback-sent'); // Статус надсилання

// URL для запиту до API для отримання кількості учасників
const url = `https://api.telegram.org/bot${token}/getChatMembersCount?chat_id=${chatId}`;

// Функція для перевірки токену бота та отримання інформації про чат
async function checkBotAndChat() {
    // Перевірка токену бота
    const checkBotUrl = `https://api.telegram.org/bot${token}/getMe`;
    try {
        const botResponse = await fetch(checkBotUrl);
        const botData = await botResponse.json();
        console.log('Bot info:', botData);

        if (!botData.ok) {
            console.error('Invalid bot token');
            return false;
        }

        // Перевірка чату
        const checkChatUrl = `https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`;
        const chatResponse = await fetch(checkChatUrl);
        const chatData = await chatResponse.json();
        console.log('Chat info:', chatData);

        return chatData.ok;
    } catch (error) {
        console.error('Error checking bot or chat:', error);
        return false;
    }
}

// Функція для отримання кількості учасників
async function getPeopleCount() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                // Вивести кількість учасників
                document.getElementById('peopleCount').textContent = data.result;
            } else {
                document.getElementById('peopleCount').textContent = 'Помилка при отриманні даних';
                console.error('Помилка:', data);
            }
        })
        .catch(error => {
            console.error('Помилка під час отримання кількості людей:', error);
            document.getElementById('peopleCount').textContent = 'Не вдалося отримати дані';
        });
}

// Викликаємо функції перевірки при завантаженні сторінки
window.onload = async () => {
    const isValid = await checkBotAndChat();
    if (!isValid) {
        console.error('Bot token or chat ID is invalid');
        document.getElementById('peopleCount').textContent = 'Помилка: Перевірте налаштування бота';
        return;
    }
    getPeopleCount();
};

// Обробник для відправки коментаря через Telegram-бота
const sendBtn = document.querySelector('.sendtg-btn');
const feedbackInput = document.getElementById('feedback');

// Обробник для кнопки "Надіслати"
sendBtn.addEventListener('click', (event) => {
    // Запобігаємо стандартному відправленню форми
    event.preventDefault();

    // Отримуємо текст коментаря або використовуємо placeholder
    const textToSend = feedbackInput.value.trim() || feedbackInput.placeholder;

    // Кодуємо текст для передачі в URL
    const encodedText = encodeURIComponent(textToSend);

    // URL для надсилання повідомлення
    const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodedText}`;

    // Відправка повідомлення через Telegram API
    fetch(sendMessageUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.ok) {
                // Очищаємо поле вводу після відправлення
                feedbackInput.value = '';
                feedbackSent.textContent = 'Пророцтво збулось!';
                feedbackSent.classList.remove('hidden');
            } else {
                console.error("Помилка надсилання:", data);
                feedbackSent.textContent = 'Не вдалося надіслати пророцтво.';
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
    feedbackSent.textContent = ''; // Очищаємо повідомлення про статус
});
