
const canvas = document.getElementById('dreamCanvas');
if (canvas) {
    const ctx = canvas.getContext('2d');


    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    let score = 0;
    let gameOver = true;
    let gameLoopId;


    const emotions = [
        { type: 'good', emoji: '😊', points: 1, color: 'green' }, // Щастя
        { type: 'good', emoji: '🌟', points: 1, color: 'green' }, // Зірка
        { type: 'good', emoji: '🥳', points: 1, color: 'green' }, // Святкування
        { type: 'good', emoji: '💖', points: 1, color: 'green' }, // Любов
        { type: 'good', emoji: '😂', points: 1, color: 'green' }, // Сміх
        { type: 'good', emoji: '👍', points: 1, color: 'green' }, // Лайк
        { type: 'good', emoji: '😇', points: 1, color: 'green' }, // Ангел
        { type: 'good', emoji: '🤩', points: 1, color: 'green' }, // Зірковий
        { type: 'good', emoji: '👏', points: 1, color: 'green' }, // Аплодисменти

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

    const player = {
        width: 60,
        height: 10,
        x: canvas.width / 2 - 30,
        y: canvas.height - 30,
        speed: 8,
        dx: 0,
        color: '#0277BD'
    };



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


    function drawMenuScreen(isGameOver = false) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

 
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



    function spawnObject() {
        const emotionType = emotions[Math.floor(Math.random() * emotions.length)];


        const NEW_SIZE = 40;

        const obj = {
            ...emotionType,
            size: NEW_SIZE,


            x: Math.random() * (canvas.width - NEW_SIZE),


            y: -NEW_SIZE,

            speed: 1.5 + Math.random() * 1.5
        };

        fallingObjects.push(obj);
    }

    function updateGame() {
        if (gameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        player.x += player.dx;

        if (player.x < 0) {
            player.x = 0;
        }
        if (player.x + player.width > canvas.width) {
            player.x = canvas.width - player.width;
        }

        for (let i = 0; i < fallingObjects.length; i++) {
            const obj = fallingObjects[i];

            obj.y += obj.speed;

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

            if (obj.y > canvas.height) {
                if (obj.type === 'good') {
                    score -= 2; 
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

        drawPlayer();
        drawScore();

        gameLoopId = requestAnimationFrame(updateGame);
    }


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

    function handleTouchStart(e) {
        if (gameOver) {
            startGame();
            return;
        }

        e.preventDefault();

        const touchX = e.touches[0].clientX;
        const canvasRect = canvas.getBoundingClientRect();

        if (touchX < canvasRect.left + canvasRect.width / 2) {
            player.dx = -player.speed;
        } else {
            player.dx = player.speed;
        }
    }

    function handleTouchEnd(e) {
        if (gameOver) return;
        player.dx = 0;
    }

    function handleMouseClick(e) {
        if (gameOver) {
            startGame();
            return;
        }
    }


    function startGame() {
        if (!gameOver) return;

        gameOver = false;
        score = 0;
        fallingObjects = [];
        player.x = canvas.width / 2 - 30;
        player.dx = 0;

        if (spawnInterval) clearInterval(spawnInterval);
        spawnInterval = setInterval(spawnObject, 1000);

        updateGame();
    }

    function endGame() {
        gameOver = true;
        clearInterval(spawnInterval);
        cancelAnimationFrame(gameLoopId);
        drawMenuScreen(true);
    }


    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('click', handleMouseClick);

    ctx.fillStyle = '#00695C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMenuScreen(false);

} else {
    console.error("Canvas 'dreamCanvas' не знайдено.");
}