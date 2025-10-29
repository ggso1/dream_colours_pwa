
// Об'єкт зі зборами порад для різних настроїв
const moodTips = {
    sad: "❤️ Порада для Суму: Дозвольте собі сумувати, але потім зробіть маленьку, приємну для вас справу (випийте какао, подивіться улюблений фільм).",
    happy: "☀️ Порада для Радості: Поділіться своїм щастям з кимось і подумайте про три речі, за які ви вдячні сьогодні. Це продовжить відчуття радості!",
    angry: "🔥 Порада для Злості: Зробіть глибокий вдих і паузу. Спробуйте фізичну активність (пробіжка, присідання), щоб вивільнити енергію, не руйнуючи нічого.",
    calm: "🧘 Порада для Спокою: Знайдіть час для тиші. Навіть 5 хвилин без гаджетів допоможуть перезавантажити нервову систему.",
    default: "Натисніть на емодзі, щоб отримати пораду для цього настрою."
};

/**
 * Показує пораду, відповідну обраному емодзі, та виділяє активний елемент.
 * @param {HTMLElement} element - Контейнер емодзі, на який клікнули.
 */
function showMoodTip(element) {
    const mood = element.getAttribute('data-mood'); // Отримуємо 'sad', 'happy', 'angry', 'calm'
    const tipText = moodTips[mood];
    const displayElement = document.getElementById('tip-display');
    const allOptions = document.querySelectorAll('.mood-option');

    // 1. Прибрати активний клас з усіх опцій
    allOptions.forEach(option => option.classList.remove('active'));

    // 2. Додати активний клас до клікнутого елемента
    element.classList.add('active');

    // 3. Показати відповідну пораду з анімацією
    if (tipText) {
        displayElement.style.opacity = '0'; // Для ефекту зникнення/появи

        setTimeout(() => {
            displayElement.textContent = tipText;
            displayElement.style.opacity = '1';
        }, 150); // Затримка для анімації
    } else {
        displayElement.textContent = moodTips.default;
        displayElement.style.opacity = '1';
    }
}

// =======================================================
// JAVАСRIPТ ЛОГІКА СЛАЙДЕРА
// =======================================================

// Ініціалізація змінних
const slider = document.getElementById('slider');
const slides = Array.from(slider.children);
const maxPage = slides.length - 1; // Максимальний індекс сторінки (2)

// Отримуємо індикатори
const dots = Array.from(document.getElementById('pagination').children);
const SWIPE_THRESHOLD = 80; // Мінімальна відстань для успішного свайпу (пікселів)

let currentPage = 0;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let slideWidth = 0; // Ширина одного слайда
const mobileFrame = document.getElementById('mobile-frame');

/**
 * Визначає ширину слайда, яка дорівнює ширині мобільного фрейму.
 */
function getSlideWidth() {
    slideWidth = mobileFrame.clientWidth;
}

/**
 * Оновлює вигляд індикаторів сторінок (крапок).
 */
function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });
}

/**
 * Переводить слайдер до поточної сторінки з анімацією або без.
 */
function snapToPage(animate = true) {
    getSlideWidth(); // Оновлюємо ширину перед розрахунком
    currentTranslate = -currentPage * slideWidth;

    // Встановлення/зняття анімації
    slider.style.transition = animate ? 'transform 0.5s ease-out' : 'none';

    // Встановлення фінальної позиції
    slider.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
}

/**
 * Обробник початку взаємодії (миша або дотик).
 */
function handleStart(event) {
    // Якщо взаємодія почалася всередині елементів вводу — не ініціюємо свайп
    if (event.target && event.target.closest && event.target.closest('textarea, input, button, select, [contenteditable]')) {
        return;
    }
    // Запобігаємо стандартному перетягуванню зображень, якщо це desktop
    if (event.type === 'mousedown') {
        event.preventDefault();
    }

    isDragging = true;
    // Визначаємо початкову позицію X
    startX = event.touches ? event.touches[0].clientX : event.clientX;
    // Вимикаємо CSS-анімацію під час перетягування
    slider.style.transition = 'none';

    // Отримуємо точне поточне зміщення
    const transformMatch = slider.style.transform.match(/translateX\(([-.\d]+)px\)/);
    if (transformMatch) {
        currentTranslate = parseFloat(transformMatch[1]);
    } else {
        // Якщо transform ще не було встановлено (початок роботи)
        currentTranslate = -currentPage * slideWidth;
    }
}

/**
 * Обробник переміщення (миша або дотик).
 */
function handleMove(event) {
    if (!isDragging) return;

    const currentX = event.touches ? event.touches[0].clientX : event.clientX;
    const diffX = currentX - startX;

    getSlideWidth();

    const maxTranslate = -maxPage * slideWidth;

    // Розрахунок нового зміщення
    let newTranslate = currentTranslate + diffX;

    // Обмеження, щоб слайдер не виходив за межі
    if (newTranslate > 0) {
        // Перша сторінка - пружний ефект
        newTranslate = diffX * 0.2;
    } else if (newTranslate < maxTranslate) {
        // Остання сторінка - жорстке обмеження
        newTranslate = maxTranslate;
    }

    slider.style.transform = `translateX(${newTranslate}px)`;

    // Запобігаємо стандартному вертикальному скролу
    if (event.touches && Math.abs(diffX) > 10) {
        event.preventDefault();
    }
}

/**
 * Обробник закінчення взаємодії (миша або дотик).
 */
function handleEnd(event) {
    if (!isDragging) return;
    isDragging = false;

    getSlideWidth();

    // Використовуємо changedTouches для touch, clientX для mouse
    const endX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const diffX = endX - startX;

    let newPage = currentPage;

    // Перевірка, чи відбувся свайп за поріг та чи не знаходимося на останній сторінці
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0 && currentPage < maxPage) {
            // Свайп вліво (наступна сторінка), тільки якщо не на останній
            newPage = currentPage + 1;
        } else if (diffX > 0) {
            // Свайп вправо (попередня сторінка)
            newPage = Math.max(0, currentPage - 1);
        }
    }

    currentPage = newPage;

    // Зафіксувати позицію на новій/поточній сторінці з анімацією
    snapToPage();
}

// Визначаємо контейнер, що приймає свайпи
const touchElement = document.getElementById('mobile-frame');

/**
 * Ініціалізація обробників подій слайдера.
 */
function initSlider() {
    // Обробники подій для Touch (Мобільні пристрої)
    touchElement.addEventListener('touchstart', handleStart, { passive: true }); // passive: true, щоб не блокувати основний потік
    touchElement.addEventListener('touchmove', handleMove, { passive: false }); // passive: false, для event.preventDefault()
    touchElement.addEventListener('touchend', handleEnd);

    // Обробники подій для Mouse (Десктоп)
    touchElement.addEventListener('mousedown', handleStart);
    // Додаємо до вікна, щоб не обривався свайп, якщо миша вийшла за межі фрейма
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handleMove(e);
        }
    });
    window.addEventListener('mouseup', handleEnd);

    // Обробники кліку на точки пагінації
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentPage = index;
            snapToPage();
        });
    });

    // Обробка зміни розміру вікна для коректного позиціонування
    window.addEventListener('resize', () => {
        snapToPage(false); // Без анімації
    });

    // Початкова ініціалізація
    snapToPage(false);
}

// Запускаємо ініціалізацію після завантаження DOM
window.onload = initSlider;






// Функція відкриття модального вікна
function openModal(color) {
    document.getElementById('modal-' + color).style.display = 'block';
}

// Функція закриття модального вікна
function closeModal(color) {
    document.getElementById('modal-' + color).style.display = 'none';
}

// Закриття модального вікна при кліку поза ним
window.onclick = function (event) {
    // Отримуємо всі модальні вікна
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}
