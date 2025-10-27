// =======================================================
// JAVASCRIPT ЛОГІКА СЛАЙДЕРА
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

/**
 * Визначає ширину слайда, яка дорівнює ширині мобільного фрейму.
 */
function getSlideWidth() {
    const mobileFrame = document.getElementById('mobile-frame');
    slideWidth = mobileFrame.clientWidth;
}

/**
 * Оновлює вигляд індикаторів сторінок (крапок).
 */
function updateDots() {
    dots.forEach((dot, index) => {
        if (index === currentPage) {
            dot.classList.remove('bg-opacity-50');
        } else {
            dot.classList.add('bg-opacity-50');
        }
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

    // Обмеження, щоб слайдер не виходив за межі (з "гумовим" ефектом)
    if (newTranslate > 0) {
        // Свайп вправо на першій сторінці (еластичність 20%)
        newTranslate = diffX * 0.2;
    } else if (newTranslate < maxTranslate) {
        // Свайп вліво на останній сторінці (еластичність 20%)
        const overflow = newTranslate - maxTranslate;
        newTranslate = maxTranslate + overflow * 0.2;
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

    const endX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const diffX = endX - startX;

    let newPage = currentPage;

    // Перевірка, чи відбувся свайп за поріг
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0) {
            // Свайп вліво (наступна сторінка)
            newPage = Math.min(maxPage, currentPage + 1);
        } else {
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

// Обробники подій для Touch (Мобільні пристрої)
touchElement.addEventListener('touchstart', handleStart);
touchElement.addEventListener('touchmove', handleMove);
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

// Обробка зміни розміру вікна для коректного позиціонування
window.addEventListener('resize', () => {
    snapToPage(false); // Без анімації
});

// Початкова ініціалізація, коли DOM повністю завантажено
window.onload = () => {
    snapToPage(false);
};

