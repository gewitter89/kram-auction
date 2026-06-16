// Lot page functionality

// Image gallery
function changeImage(thumb) {
    const mainImg = document.getElementById('mainImage');
    mainImg.src = thumb.src.replace('100x80', '600x450');
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
}

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
});

// Bid functionality
document.getElementById('bidBtn').addEventListener('click', () => {
    const input = document.getElementById('bidInput');
    const value = parseInt(input.value);
    if (value >= 1169) {
        alert(`Ставку ${value} грн. прийнято! Ви лідируєте в аукціоні.`);
        document.querySelector('.lot-info__current-price .price').textContent = value.toLocaleString('uk-UA') + ' грн.';
        input.value = value + 10;
        input.min = value + 10;
    } else {
        alert('Мінімальна ставка — 1 169 грн.');
    }
});

// Timer countdown
let endTime = Date.now() + 10 * 3600000 + 45 * 60000;

function updateLotTimer() {
    const diff = endTime - Date.now();
    if (diff <= 0) {
        document.getElementById('lotTimer').textContent = 'Аукціон завершено';
        return;
    }
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    document.getElementById('lotTimer').textContent = `${hours} год. ${minutes} хв. ${seconds} сек.`;
}

updateLotTimer();
setInterval(updateLotTimer, 1000);
