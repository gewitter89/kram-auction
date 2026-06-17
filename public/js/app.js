// XSS protection
function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

// State
let allLots = [];
let categories = [];
let currentCategory = 'all';
let currentSort = 'ending';
let currentQuery = '';

function getImageUrl(lot) {
    if (lot.main_image) return '/uploads/' + lot.main_image;
    return 'https://placehold.co/400x300/e8f0fe/1a73e8?text=' + encodeURIComponent(lot.title?.slice(0, 20) || 'Лот');
}

function formatTimeLeft(endTime) {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return 'Завершено';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days} дн. ${hours} год.`;
    if (hours > 0) return `${hours} год. ${minutes} хв.`;
    return `${minutes} хв.`;
}

function isEndingSoon(endTime) {
    return (new Date(endTime) - Date.now()) < 2 * 3600000;
}

function renderLotCard(lot) {
    const stars = Math.round(lot.seller_rating || 0);
    return `
        <div class="lot-card" data-id="${lot.id}">
            <a href="lot.html?id=${lot.id}" class="lot-card__link">
            <div class="lot-card__image">
                <img src="${esc(getImageUrl(lot))}" alt="${esc(lot.title)}" loading="lazy">
                <span class="lot-card__badge">${lot.sale_type === 'buy-now' ? 'Купити' : 'Аукціон'}</span>
                <button class="lot-card__favorite" data-id="${lot.id}" aria-label="Додати в обране">🤍</button>
            </div>
            <div class="lot-card__body">
                <span class="lot-card__category">${esc(lot.category_name || '')}</span>
                <h3 class="lot-card__title">${esc(lot.title)}</h3>
                <div class="lot-card__bids">Ставок: ${lot.bids_count || 0}</div>
                <div class="lot-card__price">${Number(lot.current_price || lot.start_price).toLocaleString('uk-UA')} грн.</div>
                <div class="lot-card__footer">
                    <div class="lot-card__timer ${isEndingSoon(lot.end_time) ? 'ending-soon' : ''}">
                        ⏱ ${formatTimeLeft(lot.end_time)}
                    </div>
                    <div class="lot-card__seller">
                        <span>${esc(lot.seller_name || '')}</span>
                    </div>
                </div>
            </div>
            </a>
        </div>
    `;
}

function renderLots(lots) {
    const grid = document.getElementById('lotsGrid');
    if (!grid) return;
    if (!lots || lots.length === 0) {
        grid.innerHTML = '<div class="lots-grid__empty">Нічого не знайдено</div>';
        return;
    }
    grid.innerHTML = lots.map(renderLotCard).join('');
    updateTimers();
}

function updateTimers() {
    const timers = document.querySelectorAll('.lot-card__timer');
    timers.forEach(timer => {
        const card = timer.closest('.lot-card');
        if (!card) return;
        const endTime = card.querySelector('.lot-card__footer')?.dataset?.endTime;
    });
}

async function loadLots(params = {}) {
    try {
        const query = {};
        if (currentCategory !== 'all') query.category = currentCategory;
        if (currentQuery) query.search = currentQuery;
        query.sort = currentSort;
        Object.assign(query, params);
        const data = await api.getLots(query);
        allLots = data.lots || [];
        renderLots(allLots);
    } catch (err) {
        const grid = document.getElementById('lotsGrid');
        if (grid) grid.innerHTML = '<div class="lots-grid__empty">Помилка завантаження: ' + esc(err.message) + '</div>';
    }
}

async function loadTopLots() {
    const topGrid = document.getElementById('topLotsGrid');
    if (!topGrid) return;
    try {
        const lots = await api.getTopLots();
        if (!lots || lots.length === 0) { topGrid.parentElement.style.display = 'none'; return; }
        topGrid.innerHTML = lots.slice(0, 6).map(lot => `
            <div class="lot-card">
                <a href="lot.html?id=${lot.id}" class="lot-card__link">
                <div class="lot-card__image">
                    <img src="${esc(getImageUrl(lot))}" alt="${esc(lot.title)}" loading="lazy">
                    <span class="lot-card__badge">${lot.sale_type === 'buy-now' ? 'Купити' : 'Аукціон'}</span>
                </div>
                <div class="lot-card__body">
                    <h3 class="lot-card__title">${esc(lot.title)}</h3>
                    <div class="lot-card__price">${Number(lot.current_price || lot.start_price).toLocaleString('uk-UA')} грн.</div>
                    <div class="lot-card__footer">
                        <div class="lot-card__timer ${isEndingSoon(lot.end_time) ? 'ending-soon' : ''}">⏱ ${formatTimeLeft(lot.end_time)}</div>
                    </div>
                </div>
                </a>
            </div>
        `).join('');
    } catch (err) {
        topGrid.innerHTML = '<div class="lots-grid__empty">Помилка</div>';
    }
}

async function loadCategories() {
    try {
        categories = await api.getCategories();
        // Update sidebar category links
        const links = document.querySelectorAll('.category-link');
        links.forEach(link => {
            const slug = link.dataset.category;
            if (slug && slug !== 'all') {
                const cat = categories.find(c => c.slug === slug);
                if (cat) link.textContent = cat.name;
            }
        });
    } catch (err) { /* ignore */ }
}

// Category filter
function setupCategoryFilter() {
    const links = document.querySelectorAll('.category-link');
    links.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentCategory = link.dataset.category || 'all';
            await loadLots();
        });
    });
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.querySelector('.search-btn');
    if (!input || !btn) return;
    async function doSearch() {
        currentQuery = input.value.trim();
        await loadLots();
    }
    btn.addEventListener('click', doSearch);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') doSearch(); });
}

function setupSort() {
    const select = document.getElementById('sortSelect');
    if (!select) return;
    select.addEventListener('change', async () => {
        currentSort = select.value;
        await loadLots();
    });
}

function setupMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;
    toggle.addEventListener('click', () => sidebar.classList.toggle('active'));
}

async function setupFavorites() {
    document.addEventListener('click', async (e) => {
        const btn = e.target.closest('.lot-card__favorite');
        if (!btn) return;
        e.preventDefault();
        const lotId = btn.dataset.id;
        if (!api.isLoggedIn()) { window.location.href = 'login.html'; return; }
        if (btn.textContent === '❤️') {
            btn.textContent = '🤍';
            try { await api.removeFavorite(lotId); } catch (err) { btn.textContent = '❤️'; }
        } else {
            btn.textContent = '❤️';
            try { await api.addFavorite(lotId); } catch (err) { btn.textContent = '🤍'; }
        }
    });
}

function setupPriceFilter() {
    const btn = document.getElementById('filterBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const from = document.getElementById('priceFrom')?.value;
        const to = document.getElementById('priceTo')?.value;
        await loadLots({ minPrice: from || undefined, maxPrice: to || undefined });
    });
}

// Banner Slider
let currentSlide = 0;
let slides, dots;

function goToSlide(index) {
    if (!slides || !dots) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index]?.classList.add('active');
    dots[index]?.classList.add('active');
    currentSlide = index;
}

function nextSlide() {
    if (!slides || slides.length === 0) return;
    currentSlide = (currentSlide + 1) % slides.length;
    goToSlide(currentSlide);
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    slides = document.querySelectorAll('.banner__slide');
    dots = document.querySelectorAll('.dot');
    if (slides.length > 0) setInterval(nextSlide, 5000);

    await loadCategories();
    await loadTopLots();
    await loadLots();
    setupCategoryFilter();
    setupSearch();
    setupSort();
    setupMobileMenu();
    setupFavorites();
    setupPriceFilter();

    // Update timers every 60s
    setInterval(updateTimers, 60000);
});