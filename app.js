// Ініціалізація змінних
const slider = document.getElementById('slider');
const dots = [document.getElementById('dot-0'), document.getElementById('dot-1')];
const SWIPE_THRESHOLD = 80; // Мінімальна відстань для успішного свайпу (пікселів)

let currentPage = 0; // Поточна сторінка: 0 або 1
let startX = 0; // Координата X початку свайпу
let isDragging = false; // Чи відбувається перетягування
let currentTranslate = 0; // Поточне зміщення слайдера

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
    const viewportWidth = window.innerWidth;
    currentTranslate = -currentPage * viewportWidth;

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
    isDragging = true;
    // Визначаємо початкову позицію X
    startX = event.touches ? event.touches[0].clientX : event.clientX;
    // Вимикаємо CSS-анімацію під час перетягування, щоб не заважала
    slider.style.transition = 'none';
    // Зберігаємо поточне зміщення перед початком перетягування
    const transformMatch = slider.style.transform.match(/translateX\(([-.\d]+)px\)/);
    if (transformMatch) {
        currentTranslate = parseFloat(transformMatch[1]);
    }
}

/**
 * Обробник переміщення (миша або дотик).
 */
function handleMove(event) {
    if (!isDragging) return;

    // Визначаємо поточну позицію
    const currentX = event.touches ? event.touches[0].clientX : event.clientX;
    const diffX = currentX - startX;
    const viewportWidth = window.innerWidth;

    // Розрахунок нового зміщення
    let newTranslate = currentTranslate + diffX;

    // Обмеження, щоб слайдер не виходив за межі
    // Обмежуємо лівий край (Page 0: 0px)
    if (newTranslate > 0) {
        // Плавне "гумове" обмеження
        newTranslate = diffX * 0.2;
    }
    // Обмежуємо правий край (Page 1: -100vw)
    else if (newTranslate < -viewportWidth) {
        // Плавне "гумове" обмеження
        newTranslate = -viewportWidth + (diffX + viewportWidth) * 0.2;
    }

    slider.style.transform = `translateX(${newTranslate}px)`;

    // Запобігаємо стандартному скролу, якщо це свайп
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

    const endX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const diffX = endX - startX; // Різниця: позитивне - свайп вправо, негативне - вліво

    let newPage = currentPage;

    // Перевірка, чи відбувся свайп за поріг
    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0) {
            // Свайп вліво (наступна сторінка: 0 -> 1)
            newPage = Math.min(1, currentPage + 1);
        } else {
            // Свайп вправо (попередня сторінка: 1 -> 0)
            newPage = Math.max(0, currentPage - 1);
        }
    }

    currentPage = newPage;

    // Зафіксувати позицію на новій/поточній сторінці з анімацією
    snapToPage();
}

// Обробники подій для Touch (Мобільні пристрої)
slider.addEventListener('touchstart', handleStart);
slider.addEventListener('touchmove', handleMove);
slider.addEventListener('touchend', handleEnd);

// Обробники подій для Mouse (Десктоп)
slider.addEventListener('mousedown', handleStart);
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

// Початкова ініціалізація
window.onload = () => {
    snapToPage(false); // Встановлюємо початкову позицію без анімації
};