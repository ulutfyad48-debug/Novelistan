// ============================================
// NOVELISTAN - GOOGLE DRIVE INTEGRATED SYSTEM
// ============================================

// Google Drive API Configuration
const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';

// Google Drive Folder IDs
const FOLDERS = {
    novel: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

// Storage for purchased episodes (uses browser localStorage)
let purchasedEpisodes = [];

// Current purchase information
let currentPurchase = null;

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    loadPurchasedEpisodes();
    loadEpisodes();
    console.log('✅ Novelistan initialized successfully!');
});

// ============================================
// STORAGE MANAGEMENT
// ============================================

function loadPurchasedEpisodes() {
    const stored = localStorage.getItem('purchased_episodes');
    if (stored) {
        try {
            purchasedEpisodes = JSON.parse(stored);
            console.log('✅ Loaded purchased episodes:', purchasedEpisodes);
        } catch (e) {
            console.error('Error loading purchased episodes:', e);
            purchasedEpisodes = [];
        }
    }
}

function savePurchasedEpisodes() {
    localStorage.setItem('purchased_episodes', JSON.stringify(purchasedEpisodes));
    console.log('✅ Saved purchased episodes:', purchasedEpisodes);
}

// ============================================
// NAVIGATION
// ============================================

function showSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');

    // Load content based on section
    if (section === 'novels') {
        loadEpisodes();
    } else if (section === 'poetry') {
        loadPoetry();
    } else if (section === 'codewords') {
        loadCodewords();
    } else if (section === 'about') {
        loadAbout();
    }

    window.scrollTo(0, 0);
}

function showHome() {
    document.getElementById('home-screen').style.display = 'block';
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    window.scrollTo(0, 0);
}

// ============================================
// GOOGLE DRIVE API FUNCTIONS
// ============================================

async function fetchDriveFiles(folderId) {
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink,mimeType,thumbnailLink)&orderBy=name`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            console.error('Drive API Error:', data.error);
            return [];
        }
        
        return data.files || [];
    } catch (error) {
        console.error('Error fetching Drive files:', error);
        return [];
    }
}

function getDriveImageUrl(fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

// ============================================
// NOVEL EPISODES (1-100)
// ============================================

function loadEpisodes() {
    const container = document.getElementById('episodes-container');
    container.innerHTML = '';

    for (let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        
        let status = '';
        let label = '';
        
        if (i <= 10) {
            // First 10 episodes are FREE
            card.classList.add('free');
            status = 'free';
            label = 'مفت';
            card.onclick = () => openEpisode(i, 'free');
        } else if (i <= 80) {
            // Episodes 11-80 (paid in packages of 5)
            const packageNum = Math.ceil((i - 10) / 5);
            const price = i <= 50 ? 50 : 100;
            
            if (purchasedEpisodes.includes(`package_${packageNum}`)) {
                card.classList.add('free');
                status = 'purchased';
                label = 'خریدا ہوا';
                card.onclick = () => openEpisode(i, 'purchased');
            } else {
                card.classList.add('paid');
                status = 'paid';
                label = `${price} روپے`;
                card.onclick = () => showPaymentModal(i, price, packageNum);
            }
        } else {
            // Last 20 episodes (81-100)
            if (purchasedEpisodes.includes('final_package')) {
                card.classList.add('free');
                status = 'purchased';
                label = 'خریدا ہوا';
                card.onclick = () => openEpisode(i, 'purchased');
            } else {
                card.classList.add('paid');
                status = 'paid';
                label = '300 روپے';
                card.onclick = () => showPaymentModal(i, 300, 'final');
            }
        }
        
        card.innerHTML = `
            <div class="episode-number">قسط ${i}</div>
            <div class="episode-label">${label}</div>
        `;

        container.appendChild(card);
    }
}

async function openEpisode(episodeNum, type) {
    try {
        console.log(`Opening episode ${episodeNum}...`);
        
        // Fetch files from Drive
        const files = await fetchDriveFiles(FOLDERS.novel);
        
        if (files.length === 0) {
            alert('❌ ناول کی فائلیں ابھی دستیاب نہیں ہیں۔ براہ کرم بعد میں کوشش کریں۔');
            return;
        }
        
        // Find the episode file
        const episodeFile = files.find(file => {
            const fileName = file.name.toLowerCase();
            const episodeStr = episodeNum.toString();
            
            // Match patterns: "1.pdf", "Episode 1.pdf", "قسط 1.pdf", "01.pdf"
            return fileName.includes(episodeStr + '.') || 
                   fileName.includes(episodeStr + ' ') ||
                   fileName.includes('0' + episodeStr + '.') ||
                   fileName.includes(`episode ${episodeStr}`) ||
                   fileName.includes(`قسط ${episodeStr}`);
        });
        
        if (episodeFile) {
            window.open(episodeFile.webViewLink, '_blank');
        } else {
            alert(`❌ قسط ${episodeNum} ابھی دستیاب نہیں ہے۔ براہ کرم بعد میں کوشش کریں۔`);
        }
    } catch (error) {
        console.error('Error opening episode:', error);
        alert('❌ قسط کھولنے میں مسئلہ ہوا۔ براہ کرم دوبارہ کوشش کریں۔');
    }
}

// ============================================
// PAYMENT SYSTEM
// ============================================

function showPaymentModal(episodeNum, price, packageId) {
    currentPurchase = { episodeNum, price, packageId };
    
    const modal = document.getElementById('payment-modal');
    const message = document.getElementById('payment-message');
    
    let messageText = '';
    
    if (typeof packageId === 'number') {
        const startEp = ((packageId - 1) * 5) + 11;
        const endEp = startEp + 4;
        messageText = `اقساط ${startEp} سے ${endEp} تک: ${price} روپے`;
    } else if (packageId === 'final') {
        messageText = `آخری 20 اقساط (81-100): ${price} روپے`;
    }
    
    message.textContent = messageText;
    modal.classList.add('active');
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
    setTimeout(() => {
        showCodeModal();
    }, 300);
}

function showCodeModal() {
    document.getElementById('code-modal').classList.add('active');
    document.getElementById('code-input').value = '';
    document.getElementById('code-input').focus();
}

function closeCodeModal() {
    document.getElementById('code-modal').classList.remove('active');
    currentPurchase = null;
}

function verifyCode() {
    const input = document.getElementById('code-input').value.trim().toUpperCase();
    
    if (!input) {
        alert('⚠️ براہ کرم کوڈ درج کریں');
        return;
    }

    if (!currentPurchase) {
        alert('❌ خرابی! براہ کرم دوبارہ کوشش کریں۔');
        closeCodeModal();
        return;
    }
    
    const { episodeNum, packageId } = currentPurchase;
    const expectedCode = generateExpectedCode(episodeNum, packageId);
    
    if (input === expectedCode) {
        // Save purchased package
        if (packageId === 'final') {
            purchasedEpisodes.push('final_package');
        } else {
            purchasedEpisodes.push(`package_${packageId}`);
        }
        savePurchasedEpisodes();
        
        closeCodeModal();
        loadEpisodes(); // Reload episodes
        
        alert('✅ کوڈ تصدیق ہو گیا! اب آپ یہ اقساط پڑھ سکتے ہیں۔');
    } else {
        alert(`❌ غلط کوڈ!\n\nآپ نے درج کیا: ${input}\nصحیح کوڈ: ${expectedCode}\n\nبراہ کرم واٹس ایپ پر رابطہ کریں۔`);
    }
}

function generateExpectedCode(episodeNum, packageId) {
    // Code format: YHD{episode}MS{package}
    if (packageId === 'final') {
        return `YHD${episodeNum}MSFINAL`;
    } else {
        return `YHD${episodeNum}MS${packageId}`;
    }
}

// ============================================
// POETRY SECTION
// ============================================

async function loadPoetry() {
    const container = document.getElementById('poetry-container');
    container.innerHTML = '<div class="loading">شاعری لوڈ ہو رہی ہے...</div>';
    
    try {
        const files = await fetchDriveFiles(FOLDERS.poetry);
        
        if (files.length > 0) {
            container.innerHTML = '';
            
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                
                // Clean file name (remove extension)
                const displayName = file.name
                    .replace('.pdf', '')
                    .replace('.txt', '')
                    .replace('.docx', '');
                
                item.innerHTML = `
                    <h3>📝 ${displayName}</h3>
                    <p>کلک کریں پڑھنے کے لیے</p>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی شاعری دستیاب نہیں ہے</div>';
        }
    } catch (error) {
        console.error('Error loading poetry:', error);
        container.innerHTML = '<div class="loading">❌ شاعری لوڈ کرنے میں مسئلہ ہوا</div>';
    }
}

// ============================================
// CODEWORDS SECTION
// ============================================

async function loadCodewords() {
    const container = document.getElementById('codewords-container');
    container.innerHTML = '<div class="loading">کوڈ ورڈز لوڈ ہو رہے ہیں...</div>';
    
    try {
        const files = await fetchDriveFiles(FOLDERS.codewords);
        
        if (files.length > 0) {
            container.innerHTML = '';
            
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                
                const displayName = file.name
                    .replace('.pdf', '')
                    .replace('.txt', '')
                    .replace('.docx', '');
                
                item.innerHTML = `
                    <h3>🔐 ${displayName}</h3>
                    <p>کلک کریں پڑھنے کے لیے</p>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی کوڈ ورڈز دستیاب نہیں ہیں</div>';
        }
    } catch (error) {
        console.error('Error loading codewords:', error);
        container.innerHTML = '<div class="loading">❌ کوڈ ورڈز لوڈ کرنے میں مسئلہ ہوا</div>';
    }
}

// ============================================
// ABOUT SECTION
// ============================================

async function loadAbout() {
    const container = document.getElementById('about-container');
    container.innerHTML = '<div class="loading">معلومات لوڈ ہو رہی ہیں...</div>';
    
    try {
        const files = await fetchDriveFiles(FOLDERS.about);
        
        if (files.length > 0) {
            container.innerHTML = '';
            
            files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                
                const displayName = file.name
                    .replace('.pdf', '')
                    .replace('.txt', '')
                    .replace('.docx', '');
                
                item.innerHTML = `
                    <h3>📄 ${displayName}</h3>
                    <p>کلک کریں پڑھنے کے لیے</p>
                `;
                
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی معلومات دستیاب نہیں ہیں</div>';
        }
    } catch (error) {
        console.error('Error loading about:', error);
        container.innerHTML = '<div class="loading">❌ معلومات لوڈ کرنے میں مسئلہ ہوا</div>';
    }
}

// ============================================
// AUTO-REFRESH (Every 5 minutes)
// ============================================

setInterval(() => {
    console.log('🔄 Auto-refreshing content...');
    
    // Check which section is active and reload it
    if (document.getElementById('novels-section').classList.contains('active')) {
        loadEpisodes();
    } else if (document.getElementById('poetry-section').classList.contains('active')) {
        loadPoetry();
    } else if (document.getElementById('codewords-section').classList.contains('active')) {
        loadCodewords();
    } else if (document.getElementById('about-section').classList.contains('active')) {
        loadAbout();
    }
}, 5 * 60 * 1000); // 5 minutes

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Clear all purchased episodes (for testing)
function clearPurchases() {
    if (confirm('کیا آپ واقعی تمام خریداری مٹانا چاہتے ہیں؟')) {
        localStorage.removeItem('purchased_episodes');
        purchasedEpisodes = [];
        loadEpisodes();
        alert('✅ تمام خریداری مٹا دی گئی');
    }
}

console.log('✅ Novelistan script loaded successfully!');
console.log('📚 Folders configured:', FOLDERS);
console.log('🔑 API Key configured:', API_KEY ? 'Yes' : 'No');