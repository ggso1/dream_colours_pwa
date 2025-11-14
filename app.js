
const moodTips = {
    sad: "❤️ Порада для Суму: Дозвольте собі сумувати, але потім зробіть маленьку, приємну для вас справу (випийте какао, подивіться улюблений фільм).",
    happy: "☀️ Порада для Радості: Поділіться своїм щастям з кимось і подумайте про три речі, за які ви вдячні сьогодні. Це продовжить відчуття радості!",
    angry: "🔥 Порада для Злості: Зробіть глибокий вдих і паузу. Спробуйте фізичну активність (пробіжка, присідання), щоб вивільнити енергію, не руйнуючи нічого.",
    calm: "🧘 Порада для Спокою: Знайдіть час для тиші. Навіть 5 хвилин без гаджетів допоможуть перезавантажити нервову систему.",
    default: "Натисніть на емодзі, щоб отримати пораду для цього настрою."
};

/**
 * @param {HTMLElement} element 
 */
function showMoodTip(element) {
    const mood = element.getAttribute('data-mood');
    const tipText = moodTips[mood];
    const displayElement = document.getElementById('tip-display');
    const allOptions = document.querySelectorAll('.mood-option');


    allOptions.forEach(option => option.classList.remove('active'));


    element.classList.add('active');


    if (tipText) {
        displayElement.style.opacity = '0';

        setTimeout(() => {
            displayElement.textContent = tipText;
            displayElement.style.opacity = '1';
        }, 150);
    } else {
        displayElement.textContent = moodTips.default;
        displayElement.style.opacity = '1';
    }
}



//  ЛОГІКА СЛАЙДЕРА

const slider = document.getElementById('slider');
const mobileFrame = document.getElementById('mobile-frame');


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


function getSlideWidth() {
    if (mobileFrame) {
        slideWidth = mobileFrame.clientWidth;
    }
}

function updateDots() {
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentPage);
    });
}


function snapToPage(animate = true) {
    if (!slider || !mobileFrame) return;

    getSlideWidth();
    currentTranslate = -currentPage * slideWidth;


    slider.style.transition = animate ? 'transform 0.5s ease-out' : 'none';


    slider.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
}


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



function initSlider() {
    if (!mobileFrame || !slider) return;

    mobileFrame.addEventListener('touchstart', handleStart, { passive: true });
    mobileFrame.addEventListener('touchmove', handleMove, { passive: false });
    mobileFrame.addEventListener('touchend', handleEnd);


    mobileFrame.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handleMove(e);
        }
    });
    window.addEventListener('mouseup', handleEnd);

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentPage = index;
            snapToPage();
        });
    });


    window.addEventListener('resize', () => {
        snapToPage(false);
    });


    snapToPage(false);
}



window.onload = initSlider;



// ЛОГІКА МОДАЛЬНИХ ВІКОН ТА МЕДИТАЦІЇ 

function openModal(color) {
    const modal = document.getElementById('modal-' + color);
    if (modal) modal.style.display = 'flex';
}

function closeModal(color) {
    const modal = document.getElementById('modal-' + color);
    if (modal) modal.style.display = 'none';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
        const openModal = Array.from(document.querySelectorAll('.modal')).find(m => getComputedStyle(m).display !== 'none');
        if (openModal && openModal.id) {
            if (openModal.id.startsWith('modal-')) {
                const colorName = openModal.id.replace('modal-', '');
                closeModal(colorName);
            } else if (openModal.id === 'mediaModal') {
                closeMediaModal();
            }
        }
    }
});

// Дані медитацій 
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


// ОБРОБНИК КЛІКУ НА ФОН

window.onclick = function (event) {
    const colorModals = document.querySelectorAll('.modal:not(#mediaModal)');
    colorModals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    if (event.target === mediaModal) {
        closeMediaModal();
    }
}

/**
 * @param {string} colorName 
 */
function tryColor(colorName) {
    const colorMap = {
        'red': '#E63946',
        'blue': '#457B9D',
        'yellow': '#FFC300',
        'green': '#2A9D8F',
        'purple': '#6F42C1',
        'orange': '#FF8C00'
    };

    const body = document.body;
    const originalColor = body.style.backgroundColor || getComputedStyle(body).backgroundColor;

    if (colorMap[colorName]) {
        body.style.backgroundColor = colorMap[colorName];
        closeModal(colorName);

        setTimeout(() => {
            if (body.style.backgroundColor === colorMap[colorName]) {
                body.style.backgroundColor = originalColor;
            }
        }, 3000);
    }
}