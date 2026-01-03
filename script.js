const FOLDERS = {
    novels: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';

function showSection(id) {
    document.getElementById('home-screen').style.display = 'none';
    const section = document.getElementById(id + '-section') || document.getElementById('novels-section');
    section.classList.add('active');
    loadFiles(FOLDERS[id], id + '-list');
}

function showHome() {
    location.reload(); 
}

async function loadFiles(folderId, containerId) {
    const container = document.getElementById(containerId) || document.getElementById('novels-list');
    container.innerHTML = 'لوڈ ہو رہا ہے...';
    
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,webViewLink)&orderBy=name`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        container.innerHTML = '';

        if (data.files && data.files.length > 0) {
            data.files.forEach(file => {
                const div = document.createElement('div');
                div.className = 'file-box';
                div.innerText = file.name.replace('.pdf', '');
                // براہ راست ایپ میں کھولنے کے لیے
                div.onclick = () => window.location.assign(file.webViewLink);
                container.appendChild(div);
            });
        } else {
            container.innerHTML = 'کوئی فائل نہیں ملی۔';
        }
    } catch (error) {
        container.innerHTML = 'کنکشن کا مسئلہ۔';
    }
}
