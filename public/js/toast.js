// Toast Notification System
(function() {
'use strict';

const container = document.createElement('div');
container.className = 'toast-container';
container.id = 'toastContainer';
document.body.appendChild(container);

const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const defaults = { duration: 4000, type: 'info', title: '', message: '' };

window.showToast = function(options) {
  const opts = Object.assign({}, defaults, typeof options === 'string' ? { message: options } : options);
  const toast = document.createElement('div');
  toast.className = `toast toast--${opts.type}`;

  toast.innerHTML = `
    <span class="toast__icon">${icons[opts.type]}</span>
    <div class="toast__body">
      ${opts.title ? `<div class="toast__title">${esc(opts.title)}</div>` : ''}
      ${opts.message ? `<div class="toast__message">${esc(opts.message)}</div>` : ''}
    </div>
    <button class="toast__close" aria-label="Закрити">✕</button>
  `;

  const closeBtn = toast.querySelector('.toast__close');
  let timer;

  const remove = () => {
    clearTimeout(timer);
    toast.classList.add('toast--removing');
    toast.addEventListener('animationend', () => toast.remove());
  };

  closeBtn.addEventListener('click', remove);

  if (opts.duration > 0) {
    timer = setTimeout(remove, opts.duration);
  }

  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => {
    if (opts.duration > 0) timer = setTimeout(remove, opts.duration);
  });

  container.appendChild(toast);

  // Limit to 5 toasts
  const toasts = container.querySelectorAll('.toast:not(.toast--removing)');
  if (toasts.length > 5) {
    toasts[0].classList.add('toast--removing');
    toasts[0].addEventListener('animationend', () => toasts[0].remove());
  }
};

})();
