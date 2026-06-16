// Sample auction lots data
const lotsData = [
    {
        id: 1,
        title: "Ноутбук 14.0 HD Dell Latitude E7470 CPU Intel Core i5 6300U 2.4GHz, RAM DDR4 8Gb, SSD m.2 256Gb",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 1159,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Dell+E7470",
        seller: "SERGEYRV",
        sellerRating: 1924,
        stars: 4,
        bids: 7,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 2,
        title: "Ноутбук Fujitsu U7411/i7-1165G7/8Gb ddr4/SSD256Gb/Intel Iris Xe/14\" Full HD IPS",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 2007,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Fujitsu+U7411",
        seller: "Madoctaurus6",
        sellerRating: 279,
        stars: 3,
        bids: 4,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 3,
        title: "Компресор безмасляний Ferrex CQB180D-2, 180 л./хв. / 8Bar /1100 Ват/ 6,2 кг.",
        category: "tools",
        categoryName: "Ручний інструмент",
        price: 1149,
        image: "https://placehold.co/400x300/fff3e0/ff6b00?text=Ferrex+CQB180",
        seller: "TarikUA",
        sellerRating: 123,
        stars: 2,
        bids: 3,
        endTime: Date.now() + 10 * 3600000,
        type: "auction"
    },
    {
        id: 4,
        title: "КОМПЛЕКТ 64GB DDR4-2133. REG. ECC. ГАРАНТІЯ!",
        category: "electronics",
        categoryName: "Комплектуючі для ПК",
        price: 3100,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=DDR4+64GB",
        seller: "themain",
        sellerRating: 2263,
        stars: 4,
        bids: 12,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 5,
        title: "Міні ПК Dell OptiPlex 9020 | i5-4590T| 8gb| 7шт",
        category: "electronics",
        categoryName: "Системні блоки, ПК",
        price: 2105,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Dell+9020",
        seller: "NimTech",
        sellerRating: 2699,
        stars: 4,
        bids: 9,
        endTime: Date.now() + 10 * 3600000,
        type: "auction"
    },
    {
        id: 6,
        title: "Ноутбук Asus x556u - Intel Core i5-6200u - 8gb RAM DDR4 - Nvidia GeForce MX 940mx 2gb",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 2300,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Asus+x556u",
        seller: "maschinery777",
        sellerRating: 2826,
        stars: 4,
        bids: 5,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 7,
        title: "Кавоварка KLARSTEIN Arabica Comfort 1350 W 20 бар (Німеччина)",
        category: "home",
        categoryName: "Техніка для кухні",
        price: 1530,
        image: "https://placehold.co/400x300/e8f4e8/28a745?text=KLARSTEIN",
        seller: "Wadim",
        sellerRating: 8693,
        stars: 5,
        bids: 8,
        endTime: Date.now() + 10 * 3600000,
        type: "auction"
    },
    {
        id: 8,
        title: "Ноутбук Acer Aspire a515-44 - AMD Ryzen 7-4700 - 8gb RAM DDR4",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 2931,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Acer+a515",
        seller: "maschinery777",
        sellerRating: 2826,
        stars: 4,
        bids: 6,
        endTime: Date.now() + 10 * 3600000,
        type: "auction"
    },
    {
        id: 9,
        title: "FPV 10 дюймів без АКБ БЕЗ РЕЗЕРВУ ВІД 1 ГРН",
        category: "electronics",
        categoryName: "Квадрокоптери",
        price: 3975,
        image: "https://placehold.co/400x300/fce4ec/dc3545?text=FPV+Drone",
        seller: "can4oko1",
        sellerRating: 3,
        stars: 1,
        bids: 22,
        endTime: Date.now() + 1 * 3600000,
        type: "auction"
    },
    {
        id: 10,
        title: "Ігровий ноутбук Dell Latitude E5570 / 15,6\" IPS / Intel Core i7-6820HQ / 8 GB DDR4 / AMD Radeon R7 M370",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 2385,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Dell+E5570",
        seller: "lerich1986",
        sellerRating: 2557,
        stars: 4,
        bids: 11,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 11,
        title: "Плазморіз з автопідпалюванням Parkside PPS 40 С3 плазмовий різак",
        category: "tools",
        categoryName: "Зварювальні апарати",
        price: 1860,
        image: "https://placehold.co/400x300/fff3e0/ff6b00?text=Parkside+PPS40",
        seller: "maschinery777",
        sellerRating: 2826,
        stars: 4,
        bids: 3,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 12,
        title: "Ноутбук Lenovo P53 - Intel Core i7-9850H - 16gb RAM DDR4 - Nvidia RTX Quadro 3000 6gb",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 9020,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Lenovo+P53",
        seller: "maschinery777",
        sellerRating: 2827,
        stars: 4,
        bids: 14,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 13,
        title: "Оприскувач акумуляторний Einhell X Change",
        category: "home",
        categoryName: "Все для поливу",
        price: 1200,
        image: "https://placehold.co/400x300/e8f4e8/28a745?text=Einhell",
        seller: "sistak",
        sellerRating: 8001,
        stars: 5,
        bids: 2,
        endTime: Date.now() + 11 * 3600000,
        type: "auction"
    },
    {
        id: 14,
        title: "Справні оригінальні Apple Watch Series 5 32gb 40мм + новий ремінець на вибір",
        category: "electronics",
        categoryName: "Розумні годинники",
        price: 630,
        image: "https://placehold.co/400x300/f3e5f5/9c27b0?text=Apple+Watch+5",
        seller: "Rusnoy",
        sellerRating: 730,
        stars: 4,
        bids: 15,
        endTime: Date.now() + 2 * 86400000,
        type: "auction"
    },
    {
        id: 15,
        title: "Блок живлення EWGA 1200 P2 1200W",
        category: "electronics",
        categoryName: "Блоки живлення",
        price: 1055,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=PSU+1200W",
        seller: "babiradd",
        sellerRating: 1766,
        stars: 4,
        bids: 4,
        endTime: Date.now() + 3 * 86400000,
        type: "auction"
    },
    {
        id: 16,
        title: "SSD диск Накопичувач SSD Micron 1100 256Gb 2280 M.2 SATA",
        category: "electronics",
        categoryName: "SSD-накопичувачі",
        price: 501,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=SSD+256GB",
        seller: "caspersfinks3",
        sellerRating: 1127,
        stars: 4,
        bids: 6,
        endTime: Date.now() + 5 * 86400000,
        type: "auction"
    },
    {
        id: 17,
        title: "Мобільний кондиціонер 12k. 3 в 1 Klarstein (З Німеччини)",
        category: "home",
        categoryName: "Кондиціонери",
        price: 2100,
        image: "https://placehold.co/400x300/e8f4e8/28a745?text=Klarstein+AC",
        seller: "Roman_Ruslanovich",
        sellerRating: 5210,
        stars: 5,
        bids: 7,
        endTime: Date.now() + 6 * 86400000,
        type: "auction"
    },
    {
        id: 18,
        title: "Шуруповерт акумуляторний CB-3996 з набором інструментів. 2 АКБ.",
        category: "tools",
        categoryName: "Шуруповерти",
        price: 630,
        image: "https://placehold.co/400x300/fff3e0/ff6b00?text=CB-3996",
        seller: "plzen",
        sellerRating: 823,
        stars: 4,
        bids: 5,
        endTime: Date.now() + 1 * 86400000,
        type: "auction"
    },
    {
        id: 19,
        title: "Тепломонокуляр нічного бачення Xinfrared T2 Pro",
        category: "electronics",
        categoryName: "Камери відеоспостереження",
        price: 677,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Xinfrared+T2",
        seller: "Seroga97",
        sellerRating: 1978,
        stars: 4,
        bids: 19,
        endTime: Date.now() + 3 * 86400000,
        type: "auction"
    },
    {
        id: 20,
        title: "Ноутбук Toshiba Satellite Pro A50-EC 15,6 i3-8130U ВІД 1 ГРН без резерву!",
        category: "electronics",
        categoryName: "Ноутбуки",
        price: 1044,
        image: "https://placehold.co/400x300/e8f0fe/1a73e8?text=Toshiba+A50",
        seller: "1NotebookService",
        sellerRating: 1147,
        stars: 4,
        bids: 8,
        endTime: Date.now() + 9 * 3600000,
        type: "auction"
    }
];

// Render lots
function renderLots(lots) {
    const grid = document.getElementById('lotsGrid');
    grid.innerHTML = '';

    lots.forEach(lot => {
        const card = document.createElement('div');
        card.className = 'lot-card';
        card.innerHTML = `
            <div class="lot-card__image">
                <img src="${lot.image}" alt="${lot.title}" loading="lazy">
                <span class="lot-card__badge">${lot.type === 'auction' ? 'Аукціон' : 'Купити'}</span>
                <button class="lot-card__favorite" aria-label="Додати в обране">🤍</button>
            </div>
            <div class="lot-card__body">
                <span class="lot-card__category">${lot.categoryName}</span>
                <h3 class="lot-card__title">${lot.title}</h3>
                <div class="lot-card__bids">Ставок: ${lot.bids}</div>
                <div class="lot-card__price">${lot.price.toLocaleString('uk-UA')} грн.</div>
                <div class="lot-card__footer">
                    <div class="lot-card__timer ${isEndingSoon(lot.endTime) ? 'ending-soon' : ''}" data-end="${lot.endTime}">
                        ⏱ ${formatTimeLeft(lot.endTime)}
                    </div>
                    <div class="lot-card__seller">
                        <span>${lot.seller}</span>
                        <span class="lot-card__seller-rating">${'★'.repeat(lot.stars)}${'☆'.repeat(5 - lot.stars)}</span>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Format time left
function formatTimeLeft(endTime) {
    const diff = endTime - Date.now();
    if (diff <= 0) return 'Завершено';

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (days > 0) return `${days} дн. ${hours} год.`;
    if (hours > 0) return `${hours} год. ${minutes} хв.`;
    return `${minutes} хв.`;
}

// Check if ending soon (less than 2 hours)
function isEndingSoon(endTime) {
    return (endTime - Date.now()) < 2 * 3600000;
}

// Update timers every minute
function updateTimers() {
    const timers = document.querySelectorAll('.lot-card__timer');
    timers.forEach(timer => {
        const endTime = parseInt(timer.dataset.end);
        timer.textContent = '⏱ ' + formatTimeLeft(endTime);
        if (isEndingSoon(endTime)) {
            timer.classList.add('ending-soon');
        }
    });
}

// Category filter
function setupCategoryFilter() {
    const links = document.querySelectorAll('.category-link');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const category = link.dataset.category;
            if (category === 'all') {
                renderLots(lotsData);
            } else {
                const filtered = lotsData.filter(lot => lot.category === category);
                renderLots(filtered);
            }
        });
    });
}

// Search
function setupSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.querySelector('.search-btn');

    function doSearch() {
        const query = input.value.toLowerCase().trim();
        if (!query) {
            renderLots(lotsData);
            return;
        }
        const filtered = lotsData.filter(lot =>
            lot.title.toLowerCase().includes(query) ||
            lot.categoryName.toLowerCase().includes(query) ||
            lot.seller.toLowerCase().includes(query)
        );
        renderLots(filtered);
    }

    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doSearch();
    });
}

// Sort
function setupSort() {
    const select = document.getElementById('sortSelect');
    select.addEventListener('change', () => {
        let sorted = [...lotsData];
        switch (select.value) {
            case 'ending':
                sorted.sort((a, b) => a.endTime - b.endTime);
                break;
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'new':
                sorted.sort((a, b) => b.id - a.id);
                break;
        }
        renderLots(sorted);
    });
}

// Mobile menu toggle
function setupMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Favorite toggle
function setupFavorites() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('lot-card__favorite')) {
            e.target.textContent = e.target.textContent === '🤍' ? '❤️' : '🤍';
        }
    });
}

// Price filter
function setupPriceFilter() {
    const btn = document.getElementById('filterBtn');
    btn.addEventListener('click', () => {
        const from = parseInt(document.getElementById('priceFrom').value) || 0;
        const to = parseInt(document.getElementById('priceTo').value) || Infinity;

        const filtered = lotsData.filter(lot => lot.price >= from && lot.price <= to);
        renderLots(filtered);
    });
}

// Banner Slider
let currentSlide = 0;
let slides;
let dots;

function goToSlide(index) {
    if (!slides || !dots) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    if (!slides || slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}

// Top Lots (first 6 ending soonest)
function renderTopLots() {
    const topGrid = document.getElementById('topLotsGrid');
    if (!topGrid) return;
    const topLots = [...lotsData].sort((a, b) => a.endTime - b.endTime).slice(0, 6);
    topGrid.innerHTML = '';
    topLots.forEach(lot => {
        const card = document.createElement('div');
        card.className = 'lot-card';
        card.innerHTML = `
            <div class="lot-card__image">
                <img src="${lot.image}" alt="${lot.title}" loading="lazy">
                <span class="lot-card__badge">${lot.type === 'auction' ? 'Аукціон' : 'Купити'}</span>
            </div>
            <div class="lot-card__body">
                <h3 class="lot-card__title">${lot.title}</h3>
                <div class="lot-card__price">${lot.price.toLocaleString('uk-UA')} грн.</div>
                <div class="lot-card__footer">
                    <div class="lot-card__timer ${isEndingSoon(lot.endTime) ? 'ending-soon' : ''}">
                        ⏱ ${formatTimeLeft(lot.endTime)}
                    </div>
                </div>
            </div>
        `;
        topGrid.appendChild(card);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Init slider
    slides = document.querySelectorAll('.banner__slide');
    dots = document.querySelectorAll('.dot');
    if (slides.length > 0) {
        setInterval(nextSlide, 5000);
    }

    renderTopLots();
    renderLots(lotsData);
    setupCategoryFilter();
    setupSearch();
    setupSort();
    setupMobileMenu();
    setupFavorites();
    setupPriceFilter();

    // Update timers every 60 seconds
    setInterval(updateTimers, 60000);
});
