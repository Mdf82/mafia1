// پایگاه داده با IndexedDB
let db;
const DB_NAME = 'MafiaGameDB';
const STORE_NAME = 'Players';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('active', 'active', { unique: false });
            }
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };
        
        request.onerror = (event) => {
            reject('خطا در باز کردن پایگاه داده');
        };
    });
}

// توابع مدیریت بازیکنان
async function loadPlayers() {
    await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => {
        renderPlayers(request.result);
    };
}

function renderPlayers(players) {
    const container = document.getElementById('playerList');
    container.innerHTML = '';
    
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player-item';
        playerDiv.innerHTML = `
            <span>${player.name} (${player.gender === 'male' ? 'مرد' : 'زن'})</span>
            <div class="player-actions">
                <button onclick="toggleActive(${player.id}, ${!player.active})">
                    ${player.active ? 'غیرفعال' : 'فعال'}
                </button>
                <button onclick="deletePlayer(${player.id})">حذف</button>
            </div>
        `;
        container.appendChild(playerDiv);
    });
}

async function addPlayer() {
    const name = document.getElementById('playerName').value;
    const gender = document.getElementById('playerGender').value;
    
    if (!name) return;
    
    await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    store.add({
        name,
        gender,
        active: true,
        createdAt: new Date()
    });
    
    document.getElementById('playerName').value = '';
    loadPlayers();
}

async function toggleActive(id, active) {
    await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => {
        const player = request.result;
        player.active = active;
        store.put(player);
        loadPlayers();
    };
}

async function deletePlayer(id) {
    await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
    loadPlayers();
}

// بارگذاری اولیه
window.onload = loadPlayers;