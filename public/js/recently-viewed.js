(function() {
'use strict';
const STORAGE_KEY = 'recentlyViewed';
const MAX_ITEMS = 12;

function getViewed() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch (e) { return []; }
}

function saveViewed(lot) {
  if (!lot || !lot.id) return;
  let items = getViewed();
  items = items.filter(i => String(i.id) !== String(lot.id));
  items.unshift({
    id: lot.id,
    title: lot.title || '',
    main_image: lot.main_image || lot.images?.[0]?.filename || '',
    current_price: lot.current_price || lot.start_price || 0,
    bids_count: lot.bids_count || 0,
    end_time: lot.end_time || '',
    sale_type: lot.sale_type || 'auction',
    category_name: lot.category_name || ''
  });
  if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  catch (e) {}
}

function renderRecentlyViewed() {
  const container = document.getElementById('recentlyViewed');
  if (!container) return;
  const items = getViewed();
  if (items.length === 0) { container.style.display = 'none'; return; }

  const grid = container.querySelector('.top-lots__grid');
  if (!grid) return;

  grid.innerHTML = items.map(lot => {
    const img = lot.main_image ? '/uploads/' + lot.main_image : 'https://placehold.co/400x300/111827/10b981?text=' + encodeURIComponent((lot.title || '').slice(0, 16));
    const price = Number(lot.current_price || 0).toLocaleString('uk-UA') + ' грн.';
    return `
      <div class="lot-card reveal">
        <a href="lot.html?id=${lot.id}">
          <div class="lot-card__image">
            <img data-src="${img}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="${esc(lot.title)}" loading="lazy">
            <span class="lot-card__badge">${lot.sale_type === 'buy-now' ? 'Купити' : 'Аукціон'}</span>
          </div>
          <div class="lot-card__body">
            <h3 class="lot-card__title">${esc(lot.title)}</h3>
            <div class="lot-card__bids">Ставок: ${lot.bids_count || 0}</div>
            <div class="lot-card__price">${price}</div>
          </div>
        </a>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('img[data-src]').forEach(img => lazyLoader?.observe(img));
}

window.recentlyViewed = { save: saveViewed, render: renderRecentlyViewed, get: getViewed };

document.addEventListener('DOMContentLoaded', () => {
  renderRecentlyViewed();
});
})();
