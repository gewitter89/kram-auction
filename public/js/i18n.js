// i18n — Simple JSON-based localization
(function() {
  const DEFAULT_LOCALE = 'uk';
  let currentLocale = localStorage.getItem('lang') || DEFAULT_LOCALE;
  let translations = {};

  async function loadLocale(locale) {
    try {
      const resp = await fetch(`/locales/${locale}.json`);
      translations = await resp.json();
      currentLocale = locale;
      localStorage.setItem('lang', locale);
      applyTranslations();
      document.documentElement.lang = locale;
      const btn = document.getElementById('langToggle');
      if (btn) btn.textContent = locale === 'uk' ? 'EN' : 'UA';
    } catch(e) {
      console.debug('i18n: failed to load locale', locale);
    }
  }

  function t(key, fallback) {
    return translations[key] || fallback || key;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[key]) {
        if (el.tagName === 'INPUT' && el.type === 'text') {
          el.placeholder = translations[key];
        } else if (el.querySelector('strong, em, a, span, b, i') || el.dataset.i18nHtml) {
          el.innerHTML = translations[key];
        } else {
          el.textContent = translations[key];
        }
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (translations[key]) el.placeholder = translations[key];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      if (translations[key]) el.title = translations[key];
    });
  }

  function toggleLang() {
    const next = currentLocale === 'uk' ? 'en' : 'uk';
    loadLocale(next);
  }

  window.i18n = { t, loadLocale, toggleLang, currentLocale };

  // Auto-init
  if (currentLocale !== DEFAULT_LOCALE) {
    loadLocale(currentLocale);
  } else {
    fetch(`/locales/uk.json`).then(r => r.json()).then(data => {
      translations = data;
      applyTranslations();
    }).catch(() => {});
  }
})();
