// Photo upload
const uploadArea = document.getElementById('photoUploadArea');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');

uploadArea.addEventListener('click', () => photoInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary)';
    uploadArea.style.background = '#f0f7ff';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    handleFiles(e.dataTransfer.files);
});

photoInput.addEventListener('change', () => {
    handleFiles(photoInput.files);
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Form submission
document.getElementById('createLotForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Лот успішно опубліковано! (демо)');
    window.location.href = 'cabinet.html';
});

// Save draft
document.getElementById('saveDraft').addEventListener('click', () => {
    alert('Чернетку збережено! (демо)');
});
