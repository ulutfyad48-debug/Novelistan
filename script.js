const FOLDERS = {
    novel: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn'
};

const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE'; // آپ کی API Key

let purchasedEpisodes = JSON.parse(localStorage.getItem('purchased_episodes')) || [];
let currentPurchase = null;

window.addEventListener('DOMContentLoaded', () => {
    loadEpisodes();
});

function showSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');
    if (section === 'poetry') loadDriveContent(FOLDERS.poetry, 'poetry-container');
}

function showHome() {
    document.getElementById('home-screen').style.display = 'block';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

function loadEpisodes() {
    const container = document.getElementById('episodes-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        // پیکیج کا حساب: ہر 5 اقساط کے لیے ایک پیکیج نمبر
        let packageId = i <= 10 ? 'free' : (i <= 80 ? Math.ceil((i - 10) / 5) : 'final');
        
        if (i <= 10 || purchasedEpisodes.includes('pkg_' + packageId)) {
            card.innerHTML = `قسط ${i}<br><span style="font-size:12px; color:green;">کھل گئی</span>`;
            card.onclick = () => openEpisode(i);
        } else {
            let price = i <= 50 ? 50 : (i <= 80 ? 100 : 300);
            card.innerHTML = `قسط ${i}<br><span style="font-size:12px; color:red;">${price} روپے</span>`;
            card.onclick = () => showPaymentModal(i, price, packageId);
        }
        container.appendChild(card);
    }
}

function showPaymentModal(num, price, pkgId) {
    currentPurchase = { episodeNum: num, packageId: pkgId };
    document.getElementById('payment-message').innerText = `قسط ${num} دیکھنے کے لیے پیکیج خریدیں۔ قیمت: ${price} روپے`;
    document.getElementById('payment-modal').classList.add('active');
}

function showCodeModal() {
    document.getElementById('payment-modal').classList.remove('active');
    document.getElementById('code-modal').classList.add('active');
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function verifyCode() {
    const input = document.getElementById('code-input').value.trim().toUpperCase();
    const pkg = currentPurchase.packageId;
    
    // فارمولا: YHD + پیکیج نمبر + MS
    const expectedCode = `YHD${pkg}MS`.toUpperCase();
    
    if (input === expectedCode) {
        purchasedEpisodes.push('pkg_' + pkg);
        localStorage.setItem('purchased_episodes', JSON.stringify(purchasedEpisodes));
        alert('✅ مبارک ہو! پورا پیکیج ان لاک ہو گیا۔');
        closeModal();
        loadEpisodes();
    } else {
        alert('❌ غلط کوڈ! درست کوڈ درج کریں۔');
    }
}

async function openEpisode(num) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.novel}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink)`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const file = data.files.find(f => f.name.includes(num.toString()));
        if (file) window.open(file.webViewLink, '_blank');
        else alert('یہ قسط ابھی اپ لوڈ نہیں ہوئی۔');
    } catch (e) { alert('کنکشن کا مسئلہ۔'); }
}

async function loadDriveContent(folderId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = 'لوڈ ہو رہا ہے...';
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink)`;
        const response = await fetch(url);
        const data = await response.json();
        container.innerHTML = '';
        data.files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'episode-card';
            item.style.width = '100%';
            item.innerHTML = `📄 ${file.name}`;
            item.onclick = () => window.open(file.webViewLink, '_blank');
            container.appendChild(item);
        });
    } catch (e) { container.innerHTML = 'فائلیں نہیں ملیں۔'; }
}
