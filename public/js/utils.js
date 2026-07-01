window.esc = function(str) { if (!str) return ''; const d = document.createElement('div'); d.textContent = str; return d.innerHTML; };

// Skeleton Loader Renderer
window.renderSkeletons = function(count = 6) {
  return Array.from({ length: count }, () => `
    <div class="lot-card skeleton--card">
      <div class="skeleton__line" style="height:200px;border-radius:0;width:100%"></div>
      <div class="skeleton__body">
        <div class="skeleton__line skeleton__line--short skeleton__line--sm"></div>
        <div class="skeleton__line skeleton__line--full skeleton__line--lg"></div>
        <div class="skeleton__line skeleton__line--medium"></div>
        <div class="skeleton__line skeleton__line--medium skeleton__line--lg"></div>
      </div>
      <div class="skeleton__footer" style="padding:12px 16px">
        <div class="skeleton__line skeleton__line--short skeleton__line--sm" style="width:40%"></div>
        <div class="skeleton__line skeleton__line--short skeleton__line--sm" style="width:30%"></div>
      </div>
    </div>
  `).join('');
};

window.renderEmptyState = function(icon, title, text, btnText, btnLink) {
  return `
    <div class="empty-state reveal">
      <div class="empty-state__icon">${icon}</div>
      <h3 class="empty-state__title">${esc(title)}</h3>
      ${text ? `<p class="empty-state__text">${esc(text)}</p>` : ''}
      ${btnText ? `<a href="${btnLink || '#'}" class="btn-primary empty-state__btn">${esc(btnText)}</a>` : ''}
    </div>
  `;
};

window.renderPrice = function(amount) {
  return Number(amount || 0).toLocaleString('uk-UA') + ' грн.';
};

window.renderStars = function(rating, max = 5) {
  const full = Math.floor(rating || 0);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = max - full - half;
  return '★'.repeat(full) + (half ? '⯨' : '') + '☆'.repeat(empty);
};

window.formatCountdown = function(endTime) {
  const diff = new Date(endTime) - Date.now();
  if (diff <= 0) return { text: 'Завершено', cls: '' };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  let cls = '';
  if (diff < 600000) cls = 'countdown--critical'; // < 10 min
  else if (diff < 3600000) cls = 'countdown--urgent'; // < 1 hour
  else if (diff < 7200000) cls = 'ending-soon';
  return {
    text: `${h > 0 ? h + ':' : ''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    cls
  };
};
