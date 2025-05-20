// APIキー設定
const API_KEY = 'AIzaSyBPVywieQEB_-ycyEdjanxZlUYeqJmG_qI';

let savedVideos = [];
let searchResults = [];
let currentScreen = 'menu';
let currentIndex = 0;

// 初期化関数：メニュー、保存された動画、検索画面、設定画面を作成
createMenu();
createSavedVideosScreen();
createSearchScreen();
createSettingsScreen();
// 最初に表示する画面をメニューに設定
switchScreen('menu');

// メニュー画面を作成する関数
function createMenu() {
    const menu = document.createElement('div');
    menu.classList.add('screen-content', 'active');
    menu.id = 'menu';

    // メニュー項目を定義（各項目に対応する画面を指定）
    const menuItems = [
        { name: '保存された動画', screen: 'saved-videos' },
        { name: 'サーチ', screen: 'search' },
        { name: '設定', screen: 'settings' },
    ];

    // メニュー項目をリストとして作成
    const ul = document.createElement('ul');
    menuItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        // 項目がクリックされたときに対応する画面に切り替える
        li.addEventListener('click', () => switchScreen(item.screen));
        ul.appendChild(li);
    });

    // メニューを画面に追加
    menu.appendChild(ul);
    document.getElementById('screen').appendChild(menu);
}

// 保存された動画画面を作成する関数
function createSavedVideosScreen() {
    const div = document.createElement('div');
    div.classList.add('screen-content');
    div.id = 'saved-videos';

    // 保存された動画のリストを作成
    const ul = document.createElement('ul');
    savedVideos.forEach(video => {
        const li = document.createElement('li');
        li.textContent = video.title;
        // クリックした動画を再生する
        li.addEventListener('click', () => playSavedVideo(video));
        ul.appendChild(li);
    });

    div.appendChild(ul);
    document.getElementById('screen').appendChild(div);
}

// 動画検索画面を作成する関数
function createSearchScreen() {
    const div = document.createElement('div');
    div.classList.add('screen-content');
    div.id = 'search';

    // 検索バーと検索ボタンを作成
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'search-bar';
    input.placeholder = '動画を検索...';

    const button = document.createElement('button');
    button.id = 'search-btn';
    button.textContent = '検索';
    // 検索ボタンがクリックされたら検索を実行
    button.addEventListener('click', () => {
        const query = input.value;
        if (query.length >= 3) searchYouTubeManual(query);
    });

    // 検索バーとボタンを配置するエリアを作成
    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.gap = '10px';
    inputArea.appendChild(input);
    inputArea.appendChild(button);

    // 検索結果を表示するリスト
    const ul = document.createElement('ul');

    div.appendChild(inputArea);
    div.appendChild(ul);
    document.getElementById('screen').appendChild(div);

    // 入力中にリアルタイムで検索
    input.addEventListener('input', searchYouTubeLive);
}

// 設定画面を作成する関数
function createSettingsScreen() {
    const div = document.createElement('div');
    div.classList.add('screen-content');
    div.id = 'settings';

    // 設定画面の内容
    const p = document.createElement('p');
    p.textContent = '設定画面です。APIキーなどを設定できます。';

    div.appendChild(p);
    document.getElementById('screen').appendChild(div);
}


// 動画検索の入力時にリアルタイムで検索を行う関数
function searchYouTubeLive(e) {
    const query = e.target.value;
    if (query.length >= 3) {
        searchYouTubeManual(query);
    }
}

// 手動でYouTube検索を実行する関数（APIを使って検索）
function searchYouTubeManual(query) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            searchResults = data.items;
            // 検索結果を表示
            displaySearchResults();
        })
        .catch(err => console.error(err));
}

// 検索結果を画面に表示する関数
function displaySearchResults() {
    const ul = document.querySelector('#search ul');
    ul.innerHTML = '';  // 既存の検索結果をクリア

    // 検索結果をリストとして表示
    searchResults.forEach(video => {
        const li = document.createElement('li');
        li.textContent = video.snippet.title;
        // 動画がクリックされたときに再生
        li.addEventListener('click', () => playVideo(video));
        ul.appendChild(li);
    });

    // 現在の画面を「search」に変更
    currentScreen = 'search';
    currentIndex = 0;
    updateSelection();
}

// 画面を切り替える関数
function switchScreen(name) {
    // すべての画面を非表示にし、選択した画面を表示
    document.querySelectorAll('.screen-content').forEach(s => s.classList.remove('active'));
    document.getElementById(name).classList.add('active');
    currentScreen = name;
    currentIndex = 0;
    updateSelection();
}

// 選択項目を移動する関数（上下移動）
function moveSelection(dir) {
    const items = document.querySelector(`#${currentScreen} ul`)?.querySelectorAll('li');
    if (!items || items.length === 0) return;
    // 現在のインデックスを更新し、選択項目を表示
    currentIndex = (currentIndex + dir + items.length) % items.length;
    updateSelection();
}

// 現在選択している項目を表示する関数
function updateSelection() {
    const items = document.querySelector(`#${currentScreen} ul`)?.querySelectorAll('li');
    items?.forEach(item => item.classList.remove('selected'));
    if (items && items[currentIndex]) items[currentIndex].classList.add('selected');
}

// 選択した項目を確定する関数（選択された項目をクリックしたのと同じ動作）
function confirmSelection() {
    const items = document.querySelector(`#${currentScreen} ul`)?.querySelectorAll('li');
    if (!items || !items[currentIndex]) return;
    items[currentIndex].click();
}

const videoContainer = document.getElementById('video-container');
// YouTube動画を再生する関数
function playVideo(video) {
    console.log(video);
    const videoId = video.id.videoId;

    // 動画を表示するコンテナがなければ作成
    if (!videoContainer) {
        const newContainer = document.createElement('div');
        newContainer.id = 'video-container';
        document.getElementById('screen').appendChild(newContainer);

        // document.getElementById('menu-btn').addEventListener('click', () => {
        //     videoContainer.classList.add("addBlock");

        // });
    }

    // iframeを使って動画を埋め込み
    const iframe = document.createElement('iframe');
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    iframe.frameborder = "0";
    iframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowfullscreen = true;

    // 画面に動画を表示[]
    const videoContainerElement = document.getElementById('video-container');
    console.log(videoContainerElement);
    videoContainerElement.innerHTML = '';
    videoContainerElement.appendChild(iframe);
}

// 保存した動画を再生する関数（クリックした動画を再生）
function playSavedVideo(video) {
    alert(`保存動画再生: ${video.title}`);
}

// ボタンのイベント設定
document.getElementById('menu-btn').addEventListener('click', () => {
    switchScreen('menu')

});
document.getElementById('prev-btn').addEventListener('click', () => moveSelection(-1));
document.getElementById('next-btn').addEventListener('click', () => moveSelection(1));
document.getElementById('play-pause-btn').addEventListener('click', confirmSelection);
document.getElementById('center-btn').addEventListener('click', confirmSelection);
