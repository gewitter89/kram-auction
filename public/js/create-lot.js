// Photo upload
const uploadArea = document.getElementById('photoUploadArea');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
let uploadedFiles = [];

uploadArea?.addEventListener('click', () => photoInput?.click());
uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = '#f0f7ff';
});
uploadArea?.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
});
uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    handleFiles(e.dataTransfer.files);
});
photoInput?.addEventListener('change', () => handleFiles(photoInput.files));

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) { alert('Фото ' + file.name + ' завелике (макс 5MB)'); return; }
        uploadedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.title = file.name;
            photoPreview?.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Load categories
async function loadCategories() {
    const select = document.getElementById('lotCategory');
    if (!select) return;
    try {
        const cats = await api.getCategories();
        // Remove existing options except placeholder
        select.innerHTML = '<option value="">Оберіть категорію</option>';
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
    } catch (err) { /* ignore */ }
}

// Get condition value mapping
function getConditionValue(display) {
    const map = {
        'Нове': 'new',
        'Б/В — відмінний': 'excellent',
        'Б/В — гарний': 'good',
        'Б/В — задовільний': 'fair',
        'На запчастини / не працює': 'parts'
    };
    return map[display] || 'used';
}

// Get delivery methods
function getDeliveryMethods() {
    const checks = document.querySelectorAll('.filter-checkboxes input[type="checkbox"]');
    return Array.from(checks).filter(c => c.checked && c.closest('.create-form__section')?.querySelector('label')?.textContent.includes('Способи доставки')).map(c => c.parentElement.textContent.trim()).join(',');
}

// Get payment methods
function getPaymentMethods() {
    const checks = document.querySelectorAll('.filter-checkboxes input[type="checkbox"]');
    // Payment methods are in the second checkbox group
    return Array.from(document.querySelectorAll('.create-form__section:last-of-type .filter-checkboxes input:checked')).map(c => c.parentElement.textContent.trim()).join(',');
}

// Form submission
document.getElementById('createLotForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!api.isLoggedIn()) { window.location.href = 'login.html'; return; }

    const btn = e.target.querySelector('[type="submit"]');
    btn.disabled = true; btn.textContent = 'Публікація...';

    try {
        const deliveryChecks = document.querySelectorAll('.create-form__section .filter-checkboxes input[type="checkbox"]');
        const deliveryMethods = Array.from(deliveryChecks).filter((c, i) => c.checked && i < 4).map(c => c.parentElement.textContent.trim()).join(',') || 'Нова Пошта';

        const paymentChecks = document.querySelectorAll('.create-form__section .filter-checkboxes input[type="checkbox"]');
        const paymentMethods = Array.from(paymentChecks).filter((c, i) => c.checked && i >= 4).map(c => c.parentElement.textContent.trim()).join(',') || 'На картку';

        const formData = new FormData();
        formData.append('title', document.getElementById('lotTitle').value.trim());
        formData.append('description', document.getElementById('lotDescription').value.trim());
        formData.append('categoryId', document.getElementById('lotCategory').value);
        formData.append('condition', getConditionValue(document.getElementById('lotCondition').value));
        formData.append('saleType', document.querySelector('input[name="saleType"]:checked')?.value || 'auction');
        formData.append('startPrice', document.getElementById('startPrice').value);
        formData.append('buyNowPrice', document.getElementById('buyNowPrice').value || '');
        formData.append('bidStep', document.getElementById('bidStep').value || '10');
        formData.append('reservePrice', document.getElementById('reservePrice').value || '');
        formData.append('duration', document.getElementById('duration').value);
        formData.append('city', document.getElementById('location').value);
        formData.append('deliveryMethods', deliveryMethods);
        formData.append('paymentMethods', paymentMethods);

        uploadedFiles.forEach(file => formData.append('images', file));

        await api.createLot(formData);
        alert('Лот успішно опубліковано!');
        window.location.href = 'cabinet.html';
    } catch (err) {
        alert('Помилка: ' + err.message);
    } finally {
        btn.disabled = false; btn.textContent = '🚀 Опублікувати лот';
    }
});

// Save draft
document.getElementById('saveDraft')?.addEventListener('click', async () => {
    alert('Функція збереження чернетки в розробці');
});

// Init
document.addEventListener('DOMContentLoaded', loadCategories);