function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

// Check auth
if (!api.isLoggedIn()) { window.location.href = 'login.html'; }

function getImageUrl(lot) {
    if (lot.main_image) return '/uploads/' + lot.main_image;
    return 'https://placehold.co/80x60/e8f0fe/1a73e8?text=' + encodeURIComponent((lot.title || '').slice(0, 10));
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

function renderLotRow(lot, extra = '') {
    return `
        <div class="lot-row" data-id="${lot.id}">
            <a href="lot.html?id=${lot.id}" style="display:flex;align-items:center;gap:12px;text-decoration:none;color:inherit;width:100%">
            <img src="${esc(getImageUrl(lot))}" alt="" class="lot-row__img">
            <div class="lot-row__info">
                <h4>${esc(lot.title || '')}</h4>
                <span class="lot-row__category">${esc(lot.category_name || '')}</span>
            </div>
            <div class="lot-row__price">${Number(lot.current_price || lot.start_price || 0).toLocaleString('uk-UA')} грн.</div>
            ${lot.end_time ? `<div class="lot-row__time">⏱ ${formatTimeLeft(lot.end_time)}</div>` : ''}
            ${extra}
            </a>
        </div>
    `;
}

async function loadProfile() {
    try {
        const user = await api.getProfile();
        const avatar = document.querySelector('.cabinet__avatar');
        const info = document.querySelector('.cabinet__user-info');
        if (info) {
            const stars = Math.round(user.rating || 0);
            info.innerHTML = `<strong>${esc(user.username || '')}</strong>
                <span>${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} (${user.reviews_count || 0} відгуків)</span>`;
        }
        // Fill settings form
        const settings = document.getElementById('section-settings');
        if (settings) {
            const inputs = {
                firstName: 'cfirstName',
                lastName: 'clastName', 
                email: 'cemail',
                phone: 'cphone',
                city: 'ccity',
                bio: 'cbio'
            };
            Object.entries(inputs).forEach(([key, id]) => {
                const el = settings.querySelector(`#${id}`);
                if (el) el.value = user[key] || '';
            });
        }
    } catch (err) { /* ignore */ }
}

async function loadMyLots(status = 'active') {
    const section = document.getElementById('section-my-lots');
    if (!section) return;
    const list = section.querySelector('.lots-list');
    if (!list) return;
    try {
        const lots = await api.getMyLots(status);
        if (!lots || lots.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">Немає лотів</p>';
            return;
        }
        list.innerHTML = lots.map(l => renderLotRow(l, `
            <div class="lot-row__stats">
                <span>👁 ${l.views_count || 0}</span>
                <span>🔨 ${l.bids_count || 0} ставок</span>
            </div>
            <div class="lot-row__actions">
                <a href="lot.html?id=${l.id}" class="btn-small">✏️</a>
            </div>
        `)).join('');
    } catch (err) {
        list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

async function loadMyBids() {
    const section = document.getElementById('section-my-bids');
    if (!section) return;
    const list = section.querySelector('.lots-list');
    if (!list) return;
    try {
        const bids = await api.getMyBids();
        if (!bids || bids.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">У вас немає ставок</p>';
            return;
        }
        list.innerHTML = bids.map(b => {
            const statusClass = b.is_winning ? 'lot-row__status--winning' : 'lot-row__status--losing';
            const statusText = b.is_winning ? '✅ Ви лідируєте' : '❌ Вас перебили';
            return renderLotRow(b, `<span class="lot-row__status ${statusClass}">${statusText}</span>`);
        }).join('');
    } catch (err) {
        list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

async function loadPurchases() {
    const section = document.getElementById('section-purchases');
    if (!section) return;
    const list = section.querySelector('.lots-list');
    if (!list) return;
    try {
        const purchases = await api.getPurchases();
        if (!purchases || purchases.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">Немає покупок</p>';
            return;
        }
        list.innerHTML = purchases.map(p => {
            const statusMap = { pending: '⏳ Очікує оплати', paid: '💳 Оплачено', shipped: '📦 Відправлено', received: '✅ Отримано' };
            const statusClass = 'lot-row__status--' + (p.status === 'received' ? 'done' : p.status === 'pending' ? 'losing' : 'winning');
            return renderLotRow(p, `
                <span class="lot-row__status ${statusClass}">${statusMap[p.status] || p.status}</span>
                ${p.status === 'shipped' ? `<button class="btn-small" onclick="confirmReceive(${p.id})">✅ Отримано</button>` : ''}
            `);
        }).join('');
    } catch (err) {
        list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

async function confirmReceive(purchaseId) {
    try { await api.markReceived(purchaseId); alert('Підтверджено!'); loadPurchases(); }
    catch (err) { alert(err.message); }
}

async function loadSales() {
    const section = document.getElementById('section-sales');
    if (!section) return;
    const list = section.querySelector('.lots-list');
    if (!list) return;
    try {
        const sales = await api.getSales();
        if (!sales || sales.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">Немає продажів</p>';
            const stats = section.querySelector('.sales-stats');
            if (stats) stats.style.display = 'none';
            return;
        }
        // Calculate stats
        const totalSold = sales.filter(s => s.status === 'received' || s.status === 'paid').length;
        const totalAmount = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);
        const statsDiv = section.querySelector('.sales-stats');
        if (statsDiv) {
            statsDiv.style.display = '';
            statsDiv.innerHTML = `
                <div class="stat-card"><span class="stat-card__value">${totalSold}</span><span class="stat-card__label">Продано</span></div>
                <div class="stat-card"><span class="stat-card__value">${totalAmount.toLocaleString('uk-UA')} грн</span><span class="stat-card__label">Загальна сума</span></div>
                <div class="stat-card"><span class="stat-card__value">${(totalSold > 0 ? 4.5 : 0).toFixed(1)} ★</span><span class="stat-card__label">Рейтинг</span></div>
            `;
        }
        if (list) {
            const statusMap = { pending: '⏳ Очікує оплати', paid: '💳 Оплачено', shipped: '📦 Відправлено', received: '✅ Отримано' };
            list.innerHTML = sales.map(s => {
                const statusClass = s.status === 'received' ? 'done' : s.status === 'pending' ? 'losing' : 'winning';
                return renderLotRow(s, `
                    <span class="lot-row__status lot-row__status--${statusClass}">${statusMap[s.status] || s.status}</span>
                    <div class="lot-row__actions">
                        ${s.status === 'pending' ? `<button class="btn-small" onclick="markShipped(${s.id})">📦 Відправити</button>` : ''}
                    </div>
                `);
            }).join('');
        }
    } catch (err) {
        if (list) list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

async function markShipped(purchaseId) {
    const tn = prompt('Введіть номер ТТН (або залиште порожнім):');
    try { await api.markShipped(purchaseId, tn || ''); alert('Відправлено!'); loadSales(); }
    catch (err) { alert(err.message); }
}

async function loadFavorites() {
    const section = document.getElementById('section-favorites');
    if (!section) return;
    const list = section.querySelector('.lots-list');
    if (!list) return;
    try {
        const favs = await api.getFavorites();
        if (!favs || favs.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">Немає обраних лотів</p>';
            return;
        }
        list.innerHTML = favs.map(f => renderLotRow(f, `
            <div class="lot-row__actions">
                <button class="btn-small btn-small--danger" onclick="removeFav(${f.id})">🗑️</button>
            </div>
        `)).join('');
    } catch (err) {
        list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

async function removeFav(lotId) {
    try { await api.removeFavorite(lotId); loadFavorites(); }
    catch (err) { alert(err.message); }
}

async function loadMessages() {
    const section = document.getElementById('section-messages');
    if (!section) return;
    const list = section.querySelector('.messages-list');
    if (!list) return;
    try {
        const convs = await api.getConversations();
        if (!convs || convs.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">Немає повідомлень</p>';
            return;
        }
        list.innerHTML = convs.map(c => `
            <div class="message-item ${c.unread ? 'message-item--unread' : ''}">
                <div class="message-item__avatar">👤</div>
                <div class="message-item__content">
                    <div class="message-item__header">
                        <strong>${esc(c.username || '')}</strong>
                        <span>${c.last_message_time ? new Date(c.last_message_time).toLocaleString('uk-UA') : ''}</span>
                    </div>
                    <p>${esc(c.last_message || '')}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

async function loadReviews() {
    const section = document.getElementById('section-reviews');
    if (!section) return;
    const list = section.querySelector('.reviews-list');
    if (!list) return;
    try {
        const user = await api.getProfile();
        const reviews = await api.request('/reviews/seller/' + user.id);
        if (!reviews || reviews.length === 0) {
            list.innerHTML = '<p style="padding:20px;color:#666">Немає відгуків</p>';
            return;
        }
        list.innerHTML = reviews.map(r => {
            const stars = Math.round(r.rating || 0);
            return `
                <div class="review-item">
                    <div class="review-item__header">
                        <strong>${esc(r.author_name || '')}</strong>
                        <span class="review-item__stars">${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}</span>
                        <span class="review-item__date">${r.created_at ? new Date(r.created_at).toLocaleDateString('uk-UA') : ''}</span>
                    </div>
                    <p>${esc(r.text || '')}</p>
                </div>
            `;
        }).join('');
    } catch (err) {
        list.innerHTML = '<p style="padding:20px;color:var(--danger)">Помилка завантаження</p>';
    }
}

// Settings form save
document.querySelector('.settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Збереження...';
    try {
        await api.updateProfile({
            firstName: document.getElementById('cfirstName')?.value || '',
            lastName: document.getElementById('clastName')?.value || '',
            phone: document.getElementById('cphone')?.value || '',
            city: document.getElementById('ccity')?.value || '',
            bio: document.getElementById('cbio')?.value || ''
        });
        alert('Налаштування збережено!');
    } catch (err) {
        alert('Помилка: ' + err.message);
    } finally {
        btn.disabled = false; btn.textContent = 'Зберегти зміни';
    }
});

// Cabinet navigation
document.querySelectorAll('.cabinet__menu-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.cabinet__menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        document.querySelectorAll('.cabinet-section').forEach(s => s.classList.remove('active'));
        const section = document.getElementById('section-' + item.dataset.section);
        if (section) section.classList.add('active');
    });
});

// Tab switching (my lots tabs)
document.querySelectorAll('.cabinet-tab').forEach(tab => {
    tab.addEventListener('click', async () => {
        document.querySelectorAll('.cabinet-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const statusMap = { 0: 'active', 1: 'ended', 2: 'draft' };
        const idx = Array.from(tab.parentElement.children).indexOf(tab);
        await loadMyLots(statusMap[idx] || 'active');
    });
});

// Logout
document.querySelector('.cabinet__menu-item:last-child')?.addEventListener('click', (e) => {
    e.preventDefault();
    api.logout();
});

// Init
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
    await loadMyLots();
});