function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }
const tt = (key, fb) => window.i18n ? window.i18n.t(key, fb) : fb;

const lotId = new URLSearchParams(window.location.search).get('id');
let lot = null;
let bidTimer = null;

async function loadLot() {
    if (!lotId) {
        document.querySelector('.lot-page').innerHTML = '<p style="padding:40px;text-align:center">Лот не знайдено</p>';
        return;
    }
    try {
        lot = await api.getLot(lotId);
        renderLot();
        if (typeof recentlyViewed !== 'undefined') recentlyViewed.save(lot);
    } catch (err) {
        document.querySelector('.lot-page').innerHTML = '<p style="padding:40px;text-align:center">Помилка: ' + esc(err.message) + '</p>';
    }
}

function renderLot() {
    if (!lot) return;
    // Breadcrumbs
    const bc = document.querySelector('.breadcrumbs');
    if (bc) {
        bc.innerHTML = `
            <a href="index.html">Головна</a> →
            <a href="index.html?category=${esc(lot.category_slug || '')}">${esc(lot.category_name || '')}</a> →
            <span>${esc(lot.title?.slice(0, 40))}</span>
        `;
    }
    // Gallery
    const mainImg = document.getElementById('mainImage');
    const thumbsContainer = document.querySelector('.lot-gallery__thumbs');
    if (lot.images && lot.images.length > 0) {
        mainImg.src = '/uploads/' + lot.images[0].filename;
        if (thumbsContainer) {
            thumbsContainer.innerHTML = lot.images.map((img, i) =>
                `<img src="/uploads/${img.filename}" alt="Фото ${i+1}" class="thumb ${i===0?'active':''}" onclick="changeImage(this)">`
            ).join('');
        }
    } else {
        mainImg.src = 'https://placehold.co/600x450/e8f0fe/1a73e8?text=' + encodeURIComponent(lot.title?.slice(0, 20) || 'Фото');
    }
    // Title
    const titleEl = document.querySelector('.lot-info__title');
    if (titleEl) titleEl.textContent = lot.title;
    document.title = lot.title + ' — KRAM.UA';
    // Meta tags for SEO
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = lot.description?.slice(0, 160) || lot.title;
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
    }
    ogTitle.content = lot.title + ' — KRAM.UA';

    const pageUrl = window.location.href.split('?')[0] + '?id=' + lot.id;
    const imageUrl = lot.main_image ? window.location.origin + '/uploads/' + lot.main_image
                                     : (lot.images?.[0]?.filename ? window.location.origin + '/uploads/' + lot.images[0].filename : '');
    const desc = lot.description?.slice(0, 200) || lot.title;

    function setMeta(attr, val, content) {
        let el = document.querySelector(`meta[${attr}="${val}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
        el.content = content;
    }
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:image', imageUrl || '/icons/og-image.svg');
    setMeta('property', 'og:description', desc);
    setMeta('name', 'twitter:title', lot.title + ' — KRAM.UA');
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', imageUrl || '/icons/og-image.svg');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = pageUrl;

    // Schema.org Product
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": lot.title,
        "description": lot.description?.substring(0, 200),
        "image": lot.main_image ? '/uploads/' + lot.main_image : '',
        "offers": {
            "@type": "Offer",
            "price": lot.current_price || lot.start_price,
            "priceCurrency": "UAH",
            "availability": "https://schema.org/InStock",
            "url": window.location.href
        }
    };
    let script = document.getElementById('product-schema');
    if (!script) { script = document.createElement('script'); script.type = 'application/ld+json'; script.id = 'product-schema'; document.head.appendChild(script); }
    script.textContent = JSON.stringify(schema);
    // Badges
    const statusEl = document.querySelector('.lot-info__status');
    if (statusEl) {
        statusEl.innerHTML = `
            <span class="lot-badge lot-badge--auction">${lot.sale_type === 'buy-now' ? tt('buy_now', 'КУПИТИ') : tt('bid', 'АУКЦІОН')}</span>
            ${lot.sale_type !== 'buy-now' ? '<span class="lot-badge lot-badge--from1">' + tt('from_1_uah', 'Від 1 грн') + '</span>' : ''}
        `;
    }
    const priceBlock = document.querySelector('.lot-info__price-block');
    if (priceBlock) {
        priceBlock.innerHTML = `
            <div class="lot-info__current-price">
                <span class="label">${lot.sale_type === 'buy-now' ? tt('price', 'Ціна:') : tt('lot_current_price', 'Поточна ціна:')}</span>
                <span class="price">${Number(lot.current_price || lot.start_price).toLocaleString(tt('current_locale', 'uk-UA') === 'uk' ? 'uk-UA' : 'en-US')} ${tt('uah', 'грн.')}.</span>
            </div>
            <div class="lot-info__bids-count">${tt('bids', 'Ставок')}: <strong>${lot.bids_count || 0}</strong></div>
        `;
    }
    // Timer
    if (lot.end_time) {
        startTimer(lot.end_time);
    }
    // Bid form
    const bidForm = document.querySelector('.lot-info__bid-form');
    if (bidForm) {
        const minBid = (lot.current_price || lot.start_price || 0) + (lot.bid_step || 10);
        if (lot.sale_type === 'buy-now') {
            bidForm.innerHTML = `
                <button class="buy-now-btn" id="buyNowBtn">${tt('lot_buy_now', 'Купити зараз')} ${Number(lot.current_price || lot.start_price).toLocaleString('uk-UA')} ${tt('uah', 'грн.')}.</button>
            `;
            document.getElementById('buyNowBtn')?.addEventListener('click', async () => {
                if (!api.isLoggedIn()) { window.location.href = 'login.html'; return; }
                try {
                    await api.buyNow(lot.id);
                    showToast({ type: 'info', title: 'Купівля оформлена!', message: '' });
                    loadLot();
                } catch (err) { showToast({ type: 'error', title: 'Помилка', message: err.message }); }
            });
        } else {
            bidForm.innerHTML = `
                <div class="bid-form">
                    <label>${tt('lot_your_bid', 'Ваша ставка')} (мін. ${minBid.toLocaleString('uk-UA')} ${tt('uah', 'грн.')}):</label>
                    <div class="bid-form__row">
                        <input type="number" value="${minBid}" min="${minBid}" class="bid-input" id="bidInput">
                        <button class="bid-btn" id="bidBtn">${tt('lot_place_bid', 'Зробити ставку')}</button>
                    </div>
                    <div class="bid-form__auto">
                        <label><input type="checkbox" id="autoBidCheck"> ${tt('lot_autobid', 'Автоставка до:')}</label>
                        <input type="number" placeholder="${tt('lot_autobid_ph', 'макс. сума')}" class="bid-input bid-input--small" id="autoMaxInput" disabled>
                    </div>
                </div>
                ${lot.buy_now_price ? `<button class="buy-now-btn" id="buyNowBtn">${tt('lot_buy_now', 'Купити зараз')} ${Number(lot.buy_now_price).toLocaleString('uk-UA')} ${tt('uah', 'грн.')}.</button>` : ''}
            `;
            document.getElementById('bidBtn')?.addEventListener('click', placeBid);
            document.getElementById('buyNowBtn')?.addEventListener('click', async () => {
                if (!api.isLoggedIn()) { window.location.href = 'login.html'; return; }
                try { await api.buyNow(lot.id); showToast({ type: 'info', title: 'Купівля оформлена!', message: '' }); loadLot(); }
                catch (err) { showToast({ type: 'error', title: 'Помилка', message: err.message }); }
            });
            document.getElementById('autoBidCheck')?.addEventListener('change', function() {
                document.getElementById('autoMaxInput').disabled = !this.checked;
            });
        }
    }
    // Seller info
    const sellerBlock = document.querySelector('.lot-info__seller');
    if (sellerBlock) {
        const stars = Math.round(lot.seller_rating || 0);
        sellerBlock.innerHTML = `
            <div class="seller-card">
                <div class="seller-card__avatar">👤</div>
                <div class="seller-card__info">
                    <a href="seller.html?username=${esc(lot.seller_name || '')}" class="seller-card__name">${esc(lot.seller_name || '')}</a>
                    <div class="seller-card__rating">
                        <span class="stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>
                        <span class="count">(${lot.seller_reviews || 0} відгуки)</span>
                    </div>
                    <span class="seller-card__location">📍 ${lot.seller_city || 'Не вказано'}</span>
                </div>
            </div>
        `;
    }
    // Favorites button
    const favBtn = document.querySelector('.lot-info__actions .action-btn:first-child');
    if (favBtn) {
        favBtn.innerHTML = `<span>${lot.isFavorite ? '❤️' : '🤍'}</span> ${lot.isFavorite ? 'В обраному' : 'В обране'}`;
        favBtn.onclick = async () => {
            if (!api.isLoggedIn()) { window.location.href = 'login.html'; return; }
            try {
                if (lot.isFavorite) { await api.removeFavorite(lot.id); lot.isFavorite = false; }
                else { await api.addFavorite(lot.id); lot.isFavorite = true; }
                favBtn.innerHTML = `<span>${lot.isFavorite ? '❤️' : '🤍'}</span> ${lot.isFavorite ? 'В обраному' : 'В обране'}`;
            } catch (err) { showToast({ type: 'error', title: 'Помилка', message: err.message }); }
        };
    }
    // Description tab
    const descPanel = document.getElementById('tab-description');
    if (descPanel) {
        descPanel.innerHTML = `
            <h3>Опис лота</h3>
            <div class="lot-specs">
                <table>
                    <tr><td>Стан:</td><td>${esc(lot.condition || 'Не вказано')}</td></tr>
                    <tr><td>Категорія:</td><td>${esc(lot.category_name || '')}</td></tr>
                    <tr><td>Тип продажу:</td><td>${lot.sale_type === 'buy-now' ? 'Купити зараз' : lot.sale_type === 'both' ? 'Аукціон + Купити зараз' : 'Аукціон'}</td></tr>
                </table>
            </div>
            <p>${esc(lot.description || '')}</p>
        `;
    }
    // Bids tab
    const bidPanel = document.getElementById('tab-bids');
    if (bidPanel && lot.bids) {
        bidPanel.innerHTML = `
            <canvas id="bidChart" style="width:100%;height:80px;margin-bottom:16px"></canvas>
            <h3>Історія ставок</h3>
            <table class="bids-table">
                <thead><tr><th>Учасник</th><th>Ставка</th><th>Час</th></tr></thead>
                <tbody>
                    ${lot.bids.length === 0 ? '<tr><td colspan="3">Ставок ще немає</td></tr>' :
                    lot.bids.map(b => `<tr><td>${esc(b.bidder || '')}</td><td>${Number(b.amount).toLocaleString('uk-UA')} грн.</td><td>${b.created_at ? new Date(b.created_at).toLocaleString('uk-UA') : ''}</td></tr>`).join('')}
                </tbody>
            </table>
        `;
        renderBidChart(lot.bids);
    }
    // Delivery tab
    const deliveryPanel = document.getElementById('tab-delivery');
    if (deliveryPanel && lot.delivery_methods) {
        const methods = lot.delivery_methods.split(',').filter(Boolean);
        deliveryPanel.querySelector('ul') && (deliveryPanel.querySelector('ul').innerHTML = methods.map(m => `<li>📦 ${esc(m)}</li>`).join(''));
    }
}

function startTimer(endTime) {
    if (bidTimer) clearInterval(bidTimer);
    const el = document.getElementById('lotTimer');
    if (!el) return;
    function tick() {
        const diff = new Date(endTime) - Date.now();
        if (diff <= 0) { el.textContent = 'Аукціон завершено'; clearInterval(bidTimer); return; }
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        el.textContent = `${hours} год. ${minutes} хв. ${seconds} сек.`;
    }
    tick();
    bidTimer = setInterval(tick, 1000);
}

async function placeBid() {
    if (!api.isLoggedIn()) { window.location.href = 'login.html'; return; }
    const input = document.getElementById('bidInput');
    const amount = parseInt(input?.value);
    if (!amount || amount < parseInt(input?.min)) { showToast({ type: 'warning', title: 'Некоректна ставка', message: 'Введіть коректну суму.' }); return; }
    try {
        const isAuto = document.getElementById('autoBidCheck')?.checked || false;
        const autoMax = isAuto ? parseInt(document.getElementById('autoMaxInput')?.value) : null;
        await api.placeBid(lot.id, amount, isAuto, autoMax);
        showToast({ type: 'info', title: 'Ставку зроблено!', message: 'Ваша ставка прийнята.' });
        loadLot();
    } catch (err) { showToast({ type: 'error', title: 'Помилка', message: err.message }); }
}

window.shareLot = function(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.querySelector('.lot-info__title')?.textContent || '');
  const urls = {
    telegram: `https://t.me/share/url?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    copy: null
  };
  if (platform === 'copy') {
    navigator.clipboard.writeText(window.location.href);
    showToast({ type: 'success', message: 'Посилання скопійовано!' });
    return;
  }
  window.open(urls[platform], '_blank', 'width=600,height=400');
};

function renderBidChart(bids) {
  const canvas = document.getElementById('bidChart');
  if (!canvas || bids.length < 2) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.parentElement.clientWidth;
  const H = canvas.height = 80;
  const prices = bids.map(b => b.amount);
  const min = Math.min(...prices) * 0.95;
  const max = Math.max(...prices) * 1.05;
  const range = max - min || 1;
  
  ctx.clearRect(0, 0, W, H);
  
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(16,185,129,0.3)');
  grad.addColorStop(1, 'rgba(16,185,129,0.02)');
  
  ctx.beginPath();
  prices.forEach((p, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - ((p - min) / range) * H;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();
}

function changeImage(thumb) {
    const mainImg = document.getElementById('mainImage');
    if (!mainImg) return;
    // Use the uploaded image path if available
        mainImg.src = thumb.src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById('tab-' + btn.dataset.tab);
        if (panel) panel.classList.add('active');
    });
});

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadLot();
    // Socket.IO real-time
    const socket = io(window.location.origin, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
        if (lotId) socket.emit('join-lot', lotId);
    });
    socket.on('bid_update', (data) => {
        if (String(data.id) === String(lotId)) {
            lot = data;
            renderLot();
            // Animate price change
            const priceEl = document.querySelector('.lot-info__current-price .price');
            if (priceEl) {
                priceEl.classList.remove('bid-popped');
                void priceEl.offsetWidth;
                priceEl.classList.add('bid-popped');
            }
        }
    });
    socket.on('outbid', (data) => {
        showToast({ type: 'warning', title: 'Вас перебили!', message: 'Вашу ставку перебито. Зробіть нову ставку.', duration: 6000 });
    });
    socket.on('auction_won', (data) => {
        if (String(data.lotId) === String(lotId)) {
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#3b82f6', '#f59e0b', '#fff'] });
                setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.7, x: 0.3 } }), 300);
                setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.7, x: 0.7 } }), 600);
            }
            showToast({ type: 'success', title: '🎉 Ви виграли!', message: 'Вітаємо! Ви перемогли в аукціоні.', duration: 8000 });
        }
    });
});