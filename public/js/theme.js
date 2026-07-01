(function() {
'use strict';
const STORAGE_KEY = 'kram-theme';
const current = localStorage.getItem(STORAGE_KEY) || 'dark';
document.documentElement.setAttribute('data-theme', current);

window.toggleTheme = function() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    updateThemeIcon(next);
};

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', () => updateThemeIcon(current));
})();
