const FOLDERS = {
    novelMain: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

const NOVELS = { 'بازگشت عشق': '1AnTGqNqtKQxRHKRXZaGxVy4H7EtlfQjI' };
const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';
const WA_NUMBERS = ['923159226260', '923359079528'];

let unlocked = JSON.parse(localStorage.getItem('nov_unlocked')) || [];
let currentPkg = "", currentNovel = "", currentScreen = "home";
const cache = {};

function getDailyCode(pkgId) {
    const d = new Date();
    return (pkgId + d.getDate() + (d.getMonth() + 1) + "X").toUpperCase();
}

function openSection(mode) {
    document.getElementById('home-screen').style.display = 'none';
    if (mode === 'novel') {
        showNovelList();
    } else {
        currentScreen = mode;
        document.getElementById('content-screen').style.display = 'block';
        const titles = { poetry: "📜 اردو شاعری", about: "👤 مصنف" };
        document.getElementById('section-title').innerText = titles[mode] || "";
        loadFiles(FOLDERS[mode]);
    }
}

function showNovelList() {
    currentScreen = "novelList";
    document.getElementById('novel-list-screen').style.display = 'block';
    const container = document.getElementById('novels-container');
    container.innerHTML = Object.keys(NOVELS).map(name => `
        <div class="novel-list-card" onclick="openNovel('${name}')">
            <h3>📖 ${name}</h3>
            <p>تمام اقساط دستیاب ہیں</p>
        </div>
    `).join('');
}

function openNovel(novelName) {
    currentScreen = "episodes";
    currentNovel = novelName;
    document.getElementById('novel-list-screen').style.display = 'none';
    document.getElementById('content-screen').style.display = 'block';
    document.getElementById('section-title').innerText = `📚 ${novelName}`;
    renderNovel(NOVELS[novelName]);
}

function renderNovel(folderId) {
    const list = document.getElementById('items-list');
    let html = '';
    for (let i = 1; i <= 100; i++) {
        let pkg = getPkg(i);
        const isOpen = i <= 10 || unlocked.includes(pkg.id);
        html += `
            <div class="card ${isOpen ? '' : 'locked'}" onclick="${isOpen ? `fetchAndOpen(${i}, '${folderId}')` : `showLock(${i}, '${pkg.id}', ${pkg.price})`}">
                <span>قسط ${i}<br><small style="color:${isOpen?'#22c55e':'#ff0a54'}">${isOpen?'🔓 اوپن':'🔒 لاک'}</small></span>
            </div>`;
    }
    list.innerHTML = html;
}

function showLock(i, pkgId, price) {
    currentPkg = pkgId;
    document.getElementById('pay-info').innerText = `📦 قسط ${i} پیکیج کا حصہ ہے\n💰 قیمت: ${price} روپے`;
    const msg = encodeURIComponent(`السلام علیکم! مجھے ${currentNovel} کا پیکیج ${pkgId} خریدنا ہے۔`);
    document.getElementById('wa-link-1').href = `https://wa.me/${WA_NUMBERS[0]}?text=${msg}`;
    document.getElementById('wa-link-2').href = `https://wa.me/${WA_NUMBERS[1]}?text=${msg}`;
    document.getElementById('pay-modal').classList.add('active');
}

async function loadFiles(fId) {
    const list = document.getElementById('items-list');
    if (cache[fId]) return renderFiles(cache[fId]);

    list.innerHTML = '<p style="grid-column:1/-1; text-align:center;">⏳ لوڈ ہو رہا ہے...</p>';
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)&pageSize=40`);
        const data = await res.json();
        cache[fId] = data.files;
        renderFiles(data.files);
    } catch (e) { list.innerHTML = '<p>⚠️ نیٹ ورک ایرر</p>'; }
}

function renderFiles(files) {
    const list = document.getElementById('items-list');
    list.innerHTML = files.map(f => `
        <div class="card" onclick="window.open('${f.mimeType.includes('image') ? `https://drive.google.com/uc?export=view&id=${f.id}` : f.webViewLink}', '_blank')">
            <span>${f.name.split('.')[0]}</span>
        </div>
    `).join('');
}

function getPkg(n) {
    if (n <= 10) return { id: "FREE", price: 0 };
    if (n <= 50) return { id: "P1_" + Math.ceil((n-10)/5), price: 50 };
    if (n <= 80) return { id: "P2_" + Math.ceil((n-50)/5), price: 100 };
    return { id: "P3_FINAL", price: 300 };
}

async function fetchAndOpen(name, fId) {
    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+name+contains+'${name}'+and+trashed=false&key=${API_KEY}&fields=files(id,webViewLink)`);
        const data = await res.json();
        if (data.files.length) window.open(data.files[0].webViewLink, '_blank');
        else alert("❌ فائل نہیں ملی!");
    } catch (e) { alert("⚠️ ایرر!"); }
}

function goBack() {
    if (currentScreen === "episodes") openSection('novel');
    else location.reload();
}

function checkAccess() {
    if (document.getElementById('user-code').value.trim().toUpperCase() === getDailyCode(currentPkg)) {
        unlocked.push(currentPkg);
        localStorage.setItem('nov_unlocked', JSON.stringify(unlocked));
        alert("✅ ان لاک ہو گیا!"); location.reload();
    } else alert("❌ غلط کوڈ!");
}

function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }
function showCodeInput() { closeModals(); document.getElementById('code-modal').classList.add('active'); }
