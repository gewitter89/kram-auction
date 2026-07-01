// Header auth state + cart/notification counters
(function() {
'use strict';

function updateHeader() {
  const token = localStorage.getItem('authToken');
  const header = document.getElementById('headerRight');
  if (!header) return;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      header.innerHTML = `
        <button id="themeToggle" class="header__icon" onclick="toggleTheme()" title="Змінити тему">☀️</button>
        <a href="cart.html" class="header__icon" title="Кошик" style="position:relative;"><img src="icons/cart.svg" alt="Кошик" width="22" height="22"><span id="cartCount" class="notification-dot" style="display:none"></span></a>
        <a href="notifications.html" class="header__icon" title="Сповіщення" style="position:relative;"><img src="icons/bell.svg" alt="Сповіщення" width="22" height="22"><span id="notifCount" class="notification-dot" style="display:none"></span></a>
        <a href="cabinet.html" class="header__icon" title="${esc(user.first_name || payload.username || 'Кабінет')}"><img src="icons/user.svg" alt="Кабінет" width="22" height="22"></a>
        <a href="#" class="header__link" onclick="logout()">Вийти</a>
      `;
      loadCounters(token);
    } catch(e) {
      // Invalid token, stay logged out
    }
  }
}

async function loadCounters(token) {
  try {
    // Cart count
    const cart = JSON.parse(localStorage.getItem('kramua_cart') || '[]');
    const cartEl = document.getElementById('cartCount');
    if (cartEl && cart.length > 0) {
      cartEl.style.display = 'block';
      cartEl.textContent = cart.length;
    }

    // Notification unread count
    const res = await fetch('/api/notifications/unread', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const data = await res.json();
      const notifEl = document.getElementById('notifCount');
      if (notifEl && data.count > 0) {
        notifEl.style.display = 'block';
      }
    }
  } catch(e) {}
}

window.logout = function() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', updateHeader);
})();
