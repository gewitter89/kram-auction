(function() {
'use strict';
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      const src = img.dataset.src;
      if (!src) return;
      img.src = src;
      img.onload = () => img.classList.add('loaded');
      img.onerror = () => img.classList.add('error');
      observer.unobserve(img);
    }
  });
}, { rootMargin: '200px' });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
});
window.lazyLoader = { observe: (el) => observer.observe(el), observeAll: (root) => root.querySelectorAll('img[data-src]').forEach(img => observer.observe(img)) };
})();
