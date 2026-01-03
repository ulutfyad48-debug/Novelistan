const DRIVE_FOLDER = '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu';
const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';
const MY_WA = "923125540048";

let unlocked = JSON.parse(localStorage.getItem('nov_unlocked')) || [];
let currentPkg = "";

function showNovels() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('novel-screen').style.display = 'block';
    renderEpisodes();
}

function goHome() { location.reload(); }

function renderEpisodes() {
    const list = document.getElementById('episodes-list');
    list.innerHTML = '';

    for (let i = 1; i <= 100; i++) {
        let pkg = getPkgData(i);
        const card = document.createElement('div');
        
        const isFree = i <= 10;
        const isOpen = unlocked.includes(pkg.id);

        if (isFree || isOpen) {
            card.className = 'ep-card';
            card.innerHTML = `قسط ${i} <span class="status-label" style="color:#22c55e">🔓 اوپن</span>`;
            card.onclick = () => openDriveFile(i);
        } else {
            card.className = 'ep-card locked';
            card.innerHTML = `قسط ${i} <span class="status-label" style="color:#e11d48">🔒 لاک</span>`;
            card.onclick = () => openPayModal(pkg, i);
        }
        list.appendChild(card);
    }
}

function getPkgData(n) {
    if (n <= 10) return { id: "FREE", price: 0 };
    if (n <= 50) return { id: "PKG1_" + Math.ceil((n-10)/5), price: 50 }; // 11-50 (50 for 5)
    if (n <= 80) return { id: "PKG2_" + Math.ceil((n-50)/5), price: 100 }; // 51-80 (100 for 5)
    return { id: "PKG3_FINAL", price: 300 }; // 81-100 (300 for all 20)
}

function openPayModal(pkg, num) {
    currentPkg = pkg.id;
    document.getElementById('pay-info').innerText = `قسط ${num} دیکھنے کے لیے پیکیج خریدیں۔ قیمت: ${pkg.price} روپے۔`;
    document.getElementById('wa-link').href = `https://wa.me/${MY_WA}?text=السلام علیکم! مجھے ناول کا پیکیج ${pkg.id} (قسط ${num}) خریدنا ہے۔ قیمت: ${pkg.price} روپے۔`;
    document.getElementById('pay-modal').classList.add('active');
}

async function openDriveFile(num) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER}'+in+parents+and+name+contains+'${num}'+and+trashed=false&key=${API_KEY}&fields=files(id,webViewLink)`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.files && data.files.length > 0) {
            window.location.assign(data.files[0].webViewLink);
        } else { alert("یہ فائل ابھی اپلوڈ نہیں ہوئی۔"); }
    } catch (e) { alert("نیٹ ورک کا مسئلہ۔"); }
}

function verifyPackage() {
    const code = document.getElementById('user-code').value.trim().toUpperCase();
    const secret = "NAV" + currentPkg + "X"; // جیسے: NAVPKG1_1X
    
    if (code === secret) {
        unlocked.push(currentPkg);
        localStorage.setItem('nov_unlocked', JSON.stringify(unlocked));
        alert("شکریہ! پیکیج ان لاک ہو گیا۔");
        location.reload();
    } else { alert("غلط کوڈ! واٹس ایپ پر رابطہ کریں۔"); }
}

function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.remove('active')); }
function showCodeInput() { closeModals(); document.getElementById('code-modal').classList.add('active'); }
