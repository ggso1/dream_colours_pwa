const token = '8527145334:AAGtkDF0Ek6FNjqQW73nn1T_NTIDE5Fzki0';
const chatId = '-4997547012';

// DOM елементи
const feedbackInput = document.getElementById('feedback');
const sendBtn = document.querySelector('.sendtg-btn');
const feedbackSent = document.getElementById('feedback-sent'); 


const url = `https://api.telegram.org/bot${token}/getChatMembersCount?chat_id=${chatId}`;



sendBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const textToSend = feedbackInput.value.trim() || feedbackInput.placeholder;

    if (!textToSend) {
        feedbackSent.textContent = 'Будь ласка, введіть текст повідомлення';
        feedbackSent.classList.remove('hidden');
        return;
    }

    const sendMessageUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const params = {
        chat_id: chatId,
        text: textToSend,
        parse_mode: 'HTML'
    };

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


feedbackInput.addEventListener('click', () => {
    feedbackSent.textContent = '';
});