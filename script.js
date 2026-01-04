const FOLDERS = {
    novelMain: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',  // Novel Main Folder
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

const NOVELS = {
    'بازگشت عشق': '1AnTGqNqtKQxRHKRXZaGxVy4H7EtlfQjI'
};

const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';
const WA_NUMBERS = ['923159226260', '923359079528'];

let unlocked = JSON.parse(localStorage.getItem('nov_unlocked')) || [];
let currentPkg = "";
let currentNovel = "";
let currentScreen = "home";

function getDailyCode(pkgId) {
    const d = new Date();
    return (pkgId + d.getDate() + (d.getMonth() + 1) + "X").toUpperCase();
}

function openSection(mode) {
    if (mode === 'novel') {
        showNovelList();
    } else {
        currentScreen = mode;
        document.getElementById('home-screen').style.display = 'none';
        document.getElementById('content-screen').style.display = 'block';
        
        const titles = { 
            poetry: "📜 اردو شاعری", 
            codewords: "🔐 کوڈ ورڈز", 
            about: "👤 مصنف کے بارے میں" 
        };
        document.getElementById('section-title').innerText = titles[mode];
        loadFiles(FOLDERS[mode]);
    }
}

function showNovelList() {
    currentScreen = "novelList";
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('novel-list-screen').style.display = 'block';
    
    const container = document.getElementById('novels-container');
    container.innerHTML = '';
    
    Object.keys(NOVELS).forEach(novelName => {
        const card = document.createElement('div');
        card.className = 'novel-list-card';
        card.innerHTML = `
            <h3>📖 ${novelName}</h3>
            <p>قسط 1 سے 100 تک</p>
        `;
        card.onclick = () => openNovel(novelName);
        container.appendChild(card);
    });
}

function openNovel(novelName) {
    currentScreen = "episodes";
    currentNovel = novelName;
    document.getElementById('novel-list-screen').style.display = 'none';
    document.getElementById('content-screen').style.display = 'block';
    document.getElementById('section-title').innerText = `📚 ${novelName} - ناول کی اقساط`;
    renderNovel(NOVELS[novelName]);
}

function renderNovel(folderId) {
    const list = document.getElementById('items-list');
    list.innerHTML = '';
    for (let i = 1; i <= 100; i++) {
        let pkg = getPkg(i);
        const isOpen = i <= 10 || unlocked.includes(pkg.id);
        
        const card = document.createElement('div');
        card.className = `card ${isOpen ? '' : 'locked'}`;
        card.innerHTML = `<span>قسط ${i}<br><small style="color:${isOpen?'#22c55e':'#ff0a54'}; font-size:0.9rem;">${isOpen?'🔓 اوپن':'🔒 لاک'}</small></span>`;
        
        card.onclick = isOpen ? () => fetchAndOpen(i, folderId) : () => {
            currentPkg = pkg.id;
            document.getElementById('pay-info').innerText = `📦 قسط ${i} پیکیج کا حصہ ہے\n💰 قیمت: ${pkg.price} روپے`;
            
            const msg = encodeURIComponent(`السلام علیکم!\n\nمجھے ${currentNovel} ناول کا پیکیج ${pkg.id} (قسط ${i}) خریدنا ہے۔\n\n💰 قیمت: ${pkg.price} روپے\n\nبراہ کرم پیمنٹ کی تفصیلات بھیجیں۔ شکریہ`);
            
            document.getElementById('wa-link-1').href = `https://wa.me/${WA_NUMBERS[0]}?text=${msg}`;
            document.getElementById('wa-link-2').href = `https://wa.me/${WA_NUMBERS[1]}?text=${msg}`;
            document.getElementById('pay-modal').classList.add('active');
        };
        list.appendChild(card);
    }
}

async function loadFiles(fId) {
    const list = document.getElementById('items-list');
    list.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--accent2);">⏳ لوڈ ہو رہا ہے...</p>';
    const url = `https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType)&orderBy=name`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        list.innerHTML = '';
        if(data.files.length === 0) { 
            list.innerHTML = '<p style="grid-column:1/-1; text-align:center;">❌ کوئی فائل نہیں ملی</p>'; 
            return; 
        }
        data.files.forEach(f => {
            const c = document.createElement('div');
            c.className = 'card';
            
            if (f.mimeType.includes('image')) {
                c.innerHTML = `<span>${f.name.replace(/\.(jpg|jpeg|png|gif)$/i,'')}</span>`;
                c.onclick = () => window.open(`https://drive.google.com/uc?export=view&id=${f.id}`, '_blank');
            } else {
                c.innerHTML = `<span>${f.name.replace('.pdf','')}</span>`;
                c.onclick = () => window.open(f.webViewLink, '_blank');
            }
            
            list.appendChild(c);
        });
    } catch (e) { 
        list.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--accent);">⚠️ فائلیں لوڈ نہیں ہو سکیں</p>'; 
    }
}

function getPkg(n) {
    if (n <= 10) return { id: "FREE", price: 0 };
    if (n <= 50) return { id: "P1_" + Math.ceil((n-10)/5), price: 50 };
    if (n <= 80) return { id: "P2_" + Math.ceil((n-50)/5), price: 100 };
    return { id: "P3_FINAL", price: 300 };
}

async function fetchAndOpen(name, fId) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${fId}'+in+parents+and+name+contains+'${name}'+and+trashed=false&key=${API_KEY}&fields=files(id,webViewLink)`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.files.length > 0) window.open(data.files[0].webViewLink, '_blank');
        else alert("❌ فائل ڈرائیو میں نہیں ملی!");
    } catch (e) { alert("⚠️ نیٹ ورک ایرر!"); }
}

function goBack() {
    if (currentScreen === "episodes") {
        document.getElementById('content-screen').style.display = 'none';
        document.getElementById('novel-list-screen').style.display = 'block';
        currentScreen = "novelList";
    } else if (currentScreen === "novelList") {
        location.reload();
    } else {
        location.reload();
    }
}

function checkAccess() {
    const enteredCode = document.getElementById('user-code').value.trim().toUpperCase();
    if (enteredCode === getDailyCode(currentPkg)) {
        unlocked.push(currentPkg);
        localStorage.setItem('nov_unlocked', JSON.stringify(unlocked));
        alert("✅ ان لاک ہو گیا!"); 
        location.reload();
    } else {
        alert("❌ غلط کوڈ! دوبارہ کوشش کریں۔");
    }
}

function closeModals() { 
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); 
}

function showCodeInput() { 
    closeModals(); 
    document.getElementById('code-modal').classList.add('active'); 
}