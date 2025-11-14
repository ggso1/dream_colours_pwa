// emotion_game.js (Фінальна версія з усіма змінами)

// === Ініціалізація Canvas та Елементів ===
const canvas = document.getElementById('dreamCanvas');
// Перевірка наявності елемента, щоб уникнути помилок, якщо слайд ще не завантажено
if (canvas) {
    const ctx = canvas.getContext('2d');

    // Встановлюємо розміри canvas відповідно до контейнера
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // === Ігрові Змінні ===
    let score = 0;
    let gameOver = true;
    let gameLoopId;

    // ОНОВЛЕНИЙ СПИСОК ЕМОЦІЙ (Більше різноманітності)
    const emotions = [
        // GOOD EMOTIONS (+1 бал)
        { type: 'good', emoji: '😊', points: 1, color: 'green' }, // Щастя
        { type: 'good', emoji: '🌟', points: 1, color: 'green' }, // Зірка
        { type: 'good', emoji: '🥳', points: 1, color: 'green' }, // Святкування
        { type: 'good', emoji: '💖', points: 1, color: 'green' }, // Любов
        { type: 'good', emoji: '😂', points: 1, color: 'green' }, // Сміх
        { type: 'good', emoji: '👍', points: 1, color: 'green' }, // Лайк
        { type: 'good', emoji: '😇', points: 1, color: 'green' }, // Ангел
        { type: 'good', emoji: '🤩', points: 1, color: 'green' }, // Зірковий
        { type: 'good', emoji: '👏', points: 1, color: 'green' }, // Аплодисменти

        // BAD EMOTIONS (-1 бал)
        { type: 'bad', emoji: '😞', points: -1, color: 'red' },   // Сум
        { type: 'bad', emoji: '😠', points: -1, color: 'red' },   // Злість
        { type: 'bad', emoji: '😭', points: -1, color: 'red' },   // Плач
        { type: 'bad', emoji: '😥', points: -1, color: 'red' },   // Розчарування
        { type: 'bad', emoji: '👎', points: -1, color: 'red' },   // Дизлайк
        { type: 'bad', emoji: '😨', points: -1, color: 'red' },   // Страх
        { type: 'bad', emoji: '😤', points: -1, color: 'red' },   // Обурювання
        { type: 'bad', emoji: '😩', points: -1, color: 'red' },   // Втома
        { type: 'bad', emoji: '🤯', points: -1, color: 'red' }    // Шокований
    ];

    let fallingObjects = [];
    let spawnInterval;
    const SCORE_RESET_THRESHOLD = -5;

    // === ГРАВЕЦЬ (Ловець) ===
    const player = {
        width: 60,
        height: 10,
        x: canvas.width / 2 - 30,
        y: canvas.height - 30,
        speed: 8,
        dx: 0,
        color: '#0277BD'
    };

    // === ФУНКЦІЇ МАЛЮВАННЯ ===

    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawObject(obj) {
        ctx.font = `${obj.size}px Arial`;
        ctx.fillText(obj.emoji, obj.x, obj.y);
    }

    function drawScore() {
        ctx.font = '24px "Pacifico"';
        ctx.fillStyle = '#00695C';
        ctx.textAlign = 'left';
        ctx.fillText(`Настрій: ${score}`, 10, 30);
    }

    // ОНОВЛЕНА ФУНКЦІЯ ДЛЯ МЕНЮ / КІНЦЯ ГРИ
    function drawMenuScreen(isGameOver = false) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Динамічний заголовок: "Кінець Гри" або "Подорож Емоцій"
        ctx.font = '40px "Lobster"';
        ctx.fillStyle = '#FBC02D';
        ctx.textAlign = 'center';

        let mainText = "Подорож Емоцій";
        if (isGameOver) {
            mainText = "Кінець Гри!";
        }

        ctx.fillText(mainText, canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';

        if (isGameOver) {
            ctx.fillText(`Фінальний Настрій: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
        }

        ctx.fillText("Торкніться екрана для початку", canvas.width / 2, canvas.height / 2 + 50);
    }

    // === ІГРОВА ЛОГІКА ===

    function spawnObject() {
        const emotionType = emotions[Math.floor(Math.random() * emotions.length)];

        // ЗМІНЕНИЙ РОЗМІР: тепер 40px
        const NEW_SIZE = 40;

        const obj = {
            ...emotionType,
            size: NEW_SIZE,

            // Коригуємо позицію X для більшого розміру
            x: Math.random() * (canvas.width - NEW_SIZE),

            // Коригуємо початкову позицію Y
            y: -NEW_SIZE,

            // ОНОВЛЕНА ШВИДКІСТЬ: діапазон від 1.5 до 3.0
            speed: 1.5 + Math.random() * 1.5
        };

        fallingObjects.push(obj);
    }

    function updateGame() {
        if (gameOver) return;

        // 1. Очистка Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Оновлення позиції гравця
        player.x += player.dx;

        // Обмеження меж гравця
        if (player.x < 0) {
            player.x = 0;
        }
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }

        // 3. Оновлення та малювання об'єктів
        for (let i = 0; i < fallingObjects.length; i++) {
            const obj = fallingObjects[i];

            obj.y += obj.speed;

            // Перевірка зіткнення з гравцем
            if (obj.y + obj.size > player.y &&
                obj.x + obj.size > player.x &&
                obj.x < player.x + player.width) {

                score += obj.points;

                fallingObjects.splice(i, 1);
                i--;

                if (score < SCORE_RESET_THRESHOLD) {
                    endGame();
                    return;
                }
                continue;
            }

            // Перевірка падіння об'єкта повз гравця (тільки для хороших емоцій)
            if (obj.y > canvas.height) {
                if (obj.type === 'good') {
                    score -= 2; // Штраф за пропуск позитиву
                }

                fallingObjects.splice(i, 1);
                i--;

                if (score < SCORE_RESET_THRESHOLD) {
                    endGame();
                    return;
                }
                continue;
            }

            drawObject(obj);
        }

        // 4. Малювання гравця та рахунку
        drawPlayer();
        drawScore();

        gameLoopId = requestAnimationFrame(updateGame);
    }

    // === КЕРУВАННЯ ===

    // ПК: Клавіатура (A/D або Стрілки)
    function handleKeyDown(e) {
        if (gameOver) return;
        if (e.key === 'ArrowRight' || e.key === 'd') {
            player.dx = player.speed;
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            player.dx = -player.speed;
        }
    }

    function handleKeyUp(e) {
        if (gameOver) return;
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
            player.dx = 0;
        }
    }

    // Мобільне керування (Торкніться ліворуч/праворуч)
    function handleTouchStart(e) {
        if (gameOver) {
            startGame();
            return;
        }

        // Запобігаємо стандартній поведінці браузера (прокручування)
        e.preventDefault();

        const touchX = e.touches[0].clientX;
        const canvasRect = canvas.getBoundingClientRect();

        // Визначаємо, чи натиснуто на ліву чи праву половину Canvas
        if (touchX < canvasRect.left + canvasRect.width / 2) {
            player.dx = -player.speed;
        } else {
            player.dx = player.speed;
        }
    }

    function handleTouchEnd(e) {
        if (gameOver) return;
        // Знімаємо рух, коли палець відпущено
        player.dx = 0;
    }

    // Обробник кліку для початку гри на ПК
    function handleMouseClick(e) {
        if (gameOver) {
            startGame();
            return;
        }
    }

    // === СТАРТ/КІНЕЦЬ ГРИ ===

    function startGame() {
        if (!gameOver) return;

        gameOver = false;
        score = 0;
        fallingObjects = [];
        player.x = canvas.width / 2 - 30;
        player.dx = 0;

        // Інтервал появи об'єктів (залишаємо 1000 мс)
        if (spawnInterval) clearInterval(spawnInterval);
        spawnInterval = setInterval(spawnObject, 1000);

        updateGame();
    }

    function endGame() {
        gameOver = true;
        clearInterval(spawnInterval);
        cancelAnimationFrame(gameLoopId);
        // Викликаємо екран меню як "Кінець Гри"
        drawMenuScreen(true);
    }

    // === ІНІЦІАЛІЗАЦІЯ ===

    // Прив'язка обробників
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    // Використовуємо { passive: false } для touchstart, щоб мати можливість викликати preventDefault()
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('click', handleMouseClick);

    // Початкове відображення
    ctx.fillStyle = '#00695C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Початковий виклик для відображення "Подорож Емоцій"
    drawMenuScreen(false);

} else {
    console.error("Canvas 'dreamCanvas' не знайдено.");
}