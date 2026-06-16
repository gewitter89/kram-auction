// Cabinet navigation
document.querySelectorAll('.cabinet__menu-item[data-section]').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Update active menu item
        document.querySelectorAll('.cabinet__menu-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Show corresponding section
        document.querySelectorAll('.cabinet-section').forEach(s => s.classList.remove('active'));
        const section = document.getElementById('section-' + item.dataset.section);
        if (section) section.classList.add('active');
    });
});

// Settings form
document.querySelector('.settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Налаштування збережено! (демо)');
});
