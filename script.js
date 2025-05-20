const API_KEY = 'AIzaSyBPVywieQEB_-ycyEdjanxZlUYeqJmG_qI';

let savedVideos = [];
let searchResults = [];
let currentScreen = 'menu';
let currentIndex = 0;

const stored = localStorage.getItem('savedVideos');
if (stored) savedVideos = JSON.parse(stored);

createMenu();
createSavedVideosScreen();
createSearchScreen();
createSettingsScreen();
switchScreen('menu');

function createMenu() {
    const menu = document.createElement('div');
    menu.classList.add('screen-content', 'active');
    menu.id = 'menu';

    const menuItems = [
        { name: '保存された動画', screen: 'saved-videos' },
        { name: 'サーチ', screen: 'search' },
        { name: '設定', screen: 'settings' },
    ];

    const ul = document.createElement('ul');
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        li.addEventListener('click', () => switchScreen(item.screen));
        ul.appendChild(li);
    });

    menu.appendChild(ul);
    document.getElementById('screen').appendChild(menu);
}

function createSavedVideosScreen() {
    const div = document.createElement('div');
    div.classList.add('screen-content');
    div.id = 'saved-videos';
    const ul = document.createElement('ul');
    div.appendChild(ul);
    document.getElementById('screen').appendChild(div);
    renderSavedVideos();
}

function renderSavedVideos() {
    const ul = document.querySelector('#saved-videos ul');
    ul.innerHTML = '';
    savedVideos.forEach(video => {
        const li = document.createElement('li');
        li.textContent = video.title;
        li.addEventListener('click', () => playVideo(video));
        ul.appendChild(li);
    });
}

function createSearchScreen() {
    const div = document.createElement('div');
    div.classList.add('screen-content');
    div.id = 'search';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'search-bar';
    input.placeholder = '動画を検索...';

    const button = document.createElement('button');
    button.id = 'search-btn';
    button.textContent = '検索';
    button.addEventListener('click', () => {
        const query = input.value;
        if (query.length >= 3) searchYouTubeManual(query);
    });

    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.gap = '10px';
    inputArea.appendChild(input);
    inputArea.appendChild(button);

    const ul = document.createElement('ul');

    div.appendChild(inputArea);
    div.appendChild(ul);
    document.getElementById('screen').appendChild(div);

    input.addEventListener('input', searchYouTubeLive);
}

function createSettingsScreen() {
    const div = document.createElement('div');
    div.classList.add('screen-content');
    div.id = 'settings';

    const p = document.createElement('p');
    p.textContent = '設定画面です。';

    div.appendChild(p);
    document.getElementById('screen').appendChild(div);
}

function searchYouTubeLive(e) {
    const query = e.target.value;
    if (query.length >= 3) searchYouTubeManual(query);
}

function searchYouTubeManual(query) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            searchResults = data.items;
            displaySearchResults();
        })
        .catch(err => console.error(err));
}

function displaySearchResults() {
    const ul = document.querySelector('#search ul');
    ul.innerHTML = '';
    searchResults.forEach(video => {
        const li = document.createElement('li');
        li.textContent = video.snippet.title;
        li.addEventListener('click', () => playVideo(video));
        ul.appendChild(li);
    });
    currentScreen = 'search';
    currentIndex = 0;
    updateSelection();
}

function playVideo(video) {
    const videoId = video.id?.videoId || video.videoId;
    const title = video.snippet?.title || video.title || 'タイトル不明';

    if (!videoId) {
        console.error('videoId が見つかりません:', video);
        return;
    }

    if (!document.getElementById('video-container')) {
        const container = document.createElement('div');
        container.id = 'video-container';
        document.getElementById('screen').appendChild(container);
    }

    const iframe = document.createElement('iframe');
    iframe.width = "100%";
    iframe.height = "300";
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const container = document.getElementById('video-container');
    container.innerHTML = '';
    container.appendChild(iframe);

    if (!savedVideos.find(v => (v.videoId) === videoId)) {
        const saved = {
            title: title,
            videoId: videoId,
        };
        savedVideos.push(saved);
        localStorage.setItem('savedVideos', JSON.stringify(savedVideos));
        renderSavedVideos();
    }
}

function switchScreen(name) {
    document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    currentScreen = name;
    currentIndex = 0;
    updateSelection();

    const container = document.getElementById('video-container');
    if (container) container.remove();
}

function moveSelection(dir) {
    const items = document.querySelector(`#${currentScreen} ul`)?.querySelectorAll('li');
    if (!items || items.length === 0) return;
    currentIndex = (currentIndex + dir + items.length) % items.length;
    updateSelection();
}

function updateSelection() {
    const items = document.querySelector(`#${currentScreen} ul`)?.querySelectorAll('li');
    items?.forEach(item => item.classList.remove('selected'));
    if (items && items[currentIndex]) items[currentIndex].classList.add('selected');
}

function confirmSelection() {
    const items = document.querySelector(`#${currentScreen} ul`)?.querySelectorAll('li');
    if (!items || !items[currentIndex]) return;
    items[currentIndex].click();
}

document.getElementById('menu-btn').addEventListener('click', () => switchScreen('menu'));
document.getElementById('prev-btn').addEventListener('click', () => moveSelection(-1));
document.getElementById('next-btn').addEventListener('click', () => moveSelection(1));
document.getElementById('play-pause-btn').addEventListener('click', confirmSelection);
document.getElementById('center-btn').addEventListener('click', confirmSelection);
