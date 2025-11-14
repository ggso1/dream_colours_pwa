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


// ----------------------------------------------------
// ЛОГІКА СЛАЙДЕРА
// ----------------------------------------------------

const slider = document.getElementById('slider');
const mobileFrame = document.getElementById('mobile-frame');

// Перевірка наявності елементів
if (!slider || !mobileFrame) {
    console.error("Елементи Slider або Mobile Frame не знайдені. Слайдер не ініціалізовано.");
}

const slides = slider ? Array.from(slider.children).filter(el => el.classList.contains('slide')) : [];
const maxPage = slides.length > 0 ? slides.length - 1 : 0;

// Отримуємо індикатори
const paginationContainer = document.getElementById('pagination');
const dots = paginationContainer ? Array.from(paginationContainer.children) : [];
const SWIPE_THRESHOLD = 80;

let currentPage = 0;
let startX = 0;
let isDragging = false;
let currentTranslate = 0;
let slideWidth = 0;


// Визначає ширину слайда, яка дорівнює ширині мобільного фрейму.
function getSlideWidth() {
    if (mobileFrame) {
        slideWidth = mobileFrame.clientWidth;
    }
}

// Оновлює вигляд індикаторів сторінок (крапок).
function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });
}


// Переводить слайдер до поточної сторінки з анімацією або без.
function snapToPage(animate = true) {
    if (!slider || !mobileFrame) return;

    getSlideWidth();
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
    if (!mobileFrame || !slider) return;

    if (event.target && event.target.closest && event.target.closest('textarea, input, button, select, [contenteditable]')) {
        return;
    }
    if (event.type === 'mousedown') {
        event.preventDefault();
    }

    isDragging = true;
    getSlideWidth();

    startX = event.touches ? event.touches[0].clientX : event.clientX;
    slider.style.transition = 'none';

    const transformMatch = slider.style.transform.match(/translateX\(([-.\d]+)px\)/);
    if (transformMatch) {
        currentTranslate = parseFloat(transformMatch[1]);
    } else {
        currentTranslate = -currentPage * slideWidth;
    }
}

function handleMove(event) {
    if (!isDragging || !slider) return;

    const currentX = event.touches ? event.touches[0].clientX : event.clientX;
    const diffX = currentX - startX;

    getSlideWidth();

    const isOverBoundary = (currentPage === maxPage && diffX < 0) || (currentPage === 0 && diffX > 0);

    if (isOverBoundary) {
        let friction = (1 - Math.abs(diffX) / slideWidth) * 0.5;
        let newTranslate = currentTranslate + diffX * friction;
        slider.style.transform = `translateX(${newTranslate}px)`;
        return;
    }

    let newTranslate = currentTranslate + diffX;
    slider.style.transform = `translateX(${newTranslate}px)`;

    if (event.touches && Math.abs(diffX) > 10) {
        event.preventDefault();
    }
}


function handleEnd(event) {
    if (!isDragging || !slider) return;
    isDragging = false;

    getSlideWidth();

    const endX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const diffX = endX - startX;

    let newPage = currentPage;

    if (Math.abs(diffX) > SWIPE_THRESHOLD) {
        if (diffX < 0 && currentPage < maxPage) {
            newPage = currentPage + 1;
        } else if (diffX > 0 && currentPage > 0) {
            newPage = currentPage - 1;
        }
    }

    currentPage = newPage;
    snapToPage();
}

/**
 * Ініціалізація обробників подій слайдера.
 */
function initSlider() {
    if (!mobileFrame || !slider) return;

    // Обробники подій для Touch (Мобільні пристрої)
    mobileFrame.addEventListener('touchstart', handleStart, { passive: true });
    mobileFrame.addEventListener('touchmove', handleMove, { passive: false });
    mobileFrame.addEventListener('touchend', handleEnd);

    // Обробники подій для Mouse (Десктоп)
    mobileFrame.addEventListener('mousedown', handleStart);
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

    // Обробка зміни розміру вікна
    window.addEventListener('resize', () => {
        snapToPage(false); // Без анімації
    });

    // Початкова ініціалізація
    snapToPage(false);
}


// Запускаємо ініціалізацію після завантаження DOM
window.onload = initSlider;


// ----------------------------------------------------
// ЛОГІКА МОДАЛЬНИХ ВІКОН ТА МЕДИТАЦІЇ (ВИПРАВЛЕНО)
// ----------------------------------------------------

// Функція відкриття будь-якої колірної модалки
function openModal(color) {
    const modal = document.getElementById('modal-' + color);
    if (modal) modal.style.display = 'flex';
}

// Функція закриття будь-якої колірної модалки
function closeModal(color) {
    const modal = document.getElementById('modal-' + color);
    if (modal) modal.style.display = 'none';
}

// Дані медитацій (виправлено шляхи до файлів у папці `video`)
const meditationData = {
    forest: { title: "🌳 Медитація Лісу: Шепіт Природи", file: "video/forest.mp4" },
    ocean: { title: "🌊 Океанський Спокій: Хвилі", file: "video/ocean.mp4" },
    rain: { title: "🌧️ Звуки Дощу: Затишок та Релакс", file: "video/rain.mp4" },
    flute: { title: "🎶 Розслаблююча Флейта: Для Глибокого Сну", file: "video/flute.mp4" }
};


const mediaModal = document.getElementById('mediaModal');
const mediaPlayer = document.getElementById('media-player');
const mediaTitle = document.getElementById('media-title');

function openMediaModal(mood) {
    const data = meditationData[mood];
    if (!data || !mediaModal || !mediaPlayer || !mediaTitle) return;

    mediaTitle.textContent = data.title;
    // Додаємо playsinline для коректного відтворення на мобільних, і обмежуємо висоту через стиль
    mediaPlayer.innerHTML = `
        <video width="100%" style="max-height:60vh;" autoplay muted loop controls playsinline webkit-playsinline>
            <source src="${data.file}" type="video/mp4">
            Ваш браузер не підтримує відео.
        </video>
    `;
    mediaModal.style.display = 'flex';
}

// Закриття медіа-модалки
function closeMediaModal() {
    if (mediaModal) mediaModal.style.display = 'none';
    if (mediaPlayer) mediaPlayer.innerHTML = '';
}

// ----------------------
// ОБРОБНИК КЛІКУ НА ФОН
// ----------------------
window.onclick = function (event) {
    // Колірні модалки
    const colorModals = document.querySelectorAll('.modal:not(#mediaModal)');
    colorModals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Медіа-модалка окремо
    if (event.target === mediaModal) {
        closeMediaModal();
    }
}
