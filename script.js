// ================================
// Core desktop state
// ================================
const appRegistry = [];
const openWindows = {};
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const appList = document.getElementById('appList');
const windowContainer = document.getElementById('windowContainer');
const taskbarApps = document.getElementById('taskbarApps');
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
const contextMenu = document.getElementById('contextMenu');
const bootScreen = document.getElementById('bootScreen');
const loginScreen = document.getElementById('loginScreen');
const lockScreen = document.getElementById('lockScreen');
const bootText = document.getElementById('bootText');
const usernameInput = document.getElementById('usernameInput');
const loginButton = document.getElementById('loginButton');
const avatarPicker = document.getElementById('avatarPicker');
const lockAvatar = document.getElementById('lockAvatar');
const lockUsername = document.getElementById('lockUsername');
const themeButtons = document.querySelectorAll('.theme-button');
const backgroundButtons = document.querySelectorAll('.background-button');
const customBackgroundInput = document.getElementById('customBackgroundInput');
const desktopElement = document.getElementById('desktop');
const storageKeys = {
  theme: 'yweb-theme',
  background: 'yweb-background',
  username: 'yweb-username',
  avatar: 'yweb-avatar'
};

let currentTheme = localStorage.getItem(storageKeys.theme) || 'default';
let currentBackground = localStorage.getItem(storageKeys.background) || 'backgrounds/default1.jpg';
let currentUser = localStorage.getItem(storageKeys.username) || '';
let currentAvatar = localStorage.getItem(storageKeys.avatar) || 'U';

// ================================
// Initial theme and background
// ================================
applyTheme(currentTheme);
applyBackground(currentBackground);

const avatarOptions = ['U', 'A', 'B', 'C', 'D', 'E'];

// ================================
// Boot, login, and desktop flow
// ================================
function renderAvatarPicker() {
  avatarPicker.innerHTML = '';
  avatarOptions.forEach((letter) => {
    const button = document.createElement('button');
    button.className = 'avatar-option';
    button.textContent = letter;
    button.addEventListener('click', () => {
      currentAvatar = letter;
      localStorage.setItem(storageKeys.avatar, letter);
      updateAvatarDisplay();
    });
    avatarPicker.appendChild(button);
  });
}

function updateAvatarDisplay() {
  const displayLetter = currentAvatar || 'U';
  lockAvatar.textContent = displayLetter;
  document.body.dataset.avatar = displayLetter;
}

function showLoginScreen() {
  bootScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  lockScreen.classList.add('hidden');
  usernameInput.value = currentUser || '';
  usernameInput.focus();
}

function showLockScreen() {
  lockUsername.textContent = currentUser || 'User';
  lockAvatar.textContent = currentAvatar || 'U';
  lockScreen.classList.remove('hidden');
  loginScreen.classList.add('hidden');
  settingsButton.classList.add('hidden');
}

function startDesktop() {
  loginScreen.classList.add('hidden');
  lockScreen.classList.add('hidden');
  desktopElement.classList.remove('locked');
  settingsButton.classList.remove('hidden');
  document.body.classList.add('desktop-ready');
  updateAvatarDisplay();
  if (currentUser) {
    const welcome = document.createElement('div');
    welcome.className = 'welcome-banner';
    welcome.textContent = `Welcome back, ${currentUser}`;
    desktopElement.appendChild(welcome);
    setTimeout(() => welcome.remove(), 2500);
  }
}

function saveUsername(username) {
  const cleanName = username.trim();
  if (!cleanName) return;
  currentUser = cleanName;
  localStorage.setItem(storageKeys.username, cleanName);
  lockUsername.textContent = currentUser;
}

function signOut() {
  localStorage.removeItem(storageKeys.username);
  currentUser = '';
  showLoginScreen();
}

window.addEventListener('load', () => {
  renderAvatarPicker();
  updateAvatarDisplay();

  const bootStages = [
    'Initializing system...',
    'Loading services...',
    'Preparing desktop...',
    'Starting system...'
  ];
  let stageIndex = 0;
  const stageTimer = setInterval(() => {
    bootText.textContent = bootStages[stageIndex] || bootStages[bootStages.length - 1];
    stageIndex += 1;
    if (stageIndex >= bootStages.length) {
      clearInterval(stageTimer);
    }
  }, 300);

  setTimeout(() => {
    bootScreen.classList.add('hidden');
    if (currentUser) {
      showLockScreen();
    } else {
      showLoginScreen();
    }
  }, 1600);
});

loginButton.addEventListener('click', () => {
  saveUsername(usernameInput.value);
  startDesktop();
});

usernameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    saveUsername(usernameInput.value);
    startDesktop();
  }
});

lockScreen.addEventListener('click', () => {
  startDesktop();
});

settingsButton.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

settingsButton.addEventListener('dblclick', () => {
  signOut();
});

startButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleStartMenu();
});

settingsClose.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyTheme(button.dataset.theme);
  });
});

backgroundButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyBackground(button.dataset.background);
  });
});

customBackgroundInput.addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    applyBackground(reader.result);
  };
  reader.readAsDataURL(file);
});

function hideContextMenu() {
  contextMenu.classList.add('hidden');
  contextMenu.style.left = '-9999px';
  contextMenu.style.top = '-9999px';
}

function shouldCloseContextMenu(target) {
  if (contextMenu.classList.contains('hidden')) return false;
  return target !== contextMenu && !contextMenu.contains(target);
}

document.addEventListener('pointerdown', (event) => {
  if (!contextMenu.classList.contains('hidden') && shouldCloseContextMenu(event.target)) {
    hideContextMenu();
  }
}, true);

document.addEventListener('click', (event) => {
  if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
    hideStartMenu();
  }
  if (!settingsModal.contains(event.target) && event.target !== settingsButton) {
    if (!settingsModal.classList.contains('hidden')) {
      settingsModal.classList.add('hidden');
    }
  }
  if (!contextMenu.classList.contains('hidden') && shouldCloseContextMenu(event.target)) {
    hideContextMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideContextMenu();
    hideStartMenu();
    if (!settingsModal.classList.contains('hidden')) {
      settingsModal.classList.add('hidden');
    }
  }
});

desktopElement.addEventListener('click', (event) => {
  if (!contextMenu.classList.contains('hidden') && shouldCloseContextMenu(event.target)) {
    hideContextMenu();
  }
});

desktopElement.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  event.stopPropagation();
  const rect = desktopElement.getBoundingClientRect();
  const x = Math.min(event.clientX - rect.left, rect.width - 180);
  const y = Math.min(event.clientY - rect.top, rect.height - 120);

  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.classList.remove('hidden');
  contextMenu.style.zIndex = '260';
});

windowContainer.addEventListener('contextmenu', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

contextMenu.addEventListener('mousedown', (event) => {
  event.stopPropagation();
});

contextMenu.addEventListener('click', (event) => {
  const button = event.target.closest('.context-menu-item');
  if (!button) return;

  const action = button.dataset.action;
  if (action === 'settings') {
    settingsModal.classList.remove('hidden');
    hideContextMenu();
  }
  if (action === 'refresh') {
    applyBackground(currentBackground);
    hideContextMenu();
  }
  event.stopPropagation();
});

hideContextMenu();

// ================================
// Desktop interactions: start menu, settings, context menu
// ================================
function toggleStartMenu() {
  if (startMenu.classList.contains('hidden')) {
    startMenu.classList.remove('hidden');
    startMenu.classList.add('show');
  } else {
    startMenu.classList.add('hidden');
    startMenu.classList.remove('show');
  }
}

function hideStartMenu() {
  startMenu.classList.add('hidden');
  startMenu.classList.remove('show');
}

// ================================
// Theme and background handling
// ================================
function applyTheme(theme) {
  document.body.classList.remove('theme-default', 'theme-cobalt', 'theme-sunset', 'theme-forest');
  document.body.classList.add(`theme-${theme}`);
  currentTheme = theme;
  localStorage.setItem(storageKeys.theme, theme);
  updateSelectionState();
}

function applyBackground(backgroundValue) {
  currentBackground = backgroundValue;
  localStorage.setItem(storageKeys.background, backgroundValue);

  if (backgroundValue.startsWith('backgrounds/') || backgroundValue.startsWith('data:')) {
    desktopElement.style.background = `url(${backgroundValue}) center/cover no-repeat`;
  } else {
    desktopElement.style.background = getBackgroundValue(backgroundValue);
  }

  updateSelectionState();
}

function updateSelectionState() {
  themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === currentTheme);
  });

  backgroundButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.background === currentBackground);
  });
}

function getThemeBackground(theme) {
  switch (theme) {
    case 'cobalt':
      return 'linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #0f172a 100%)';
    case 'sunset':
      return 'linear-gradient(145deg, #ff7a18 0%, #af1172 45%, #3a1c71 100%)';
    case 'forest':
      return 'linear-gradient(145deg, #0b3d2e 0%, #14532d 45%, #134e4a 100%)';
    default:
      return 'linear-gradient(145deg, #1b2735 0%, #19212b 45%, #1f3044 100%)';
  }
}

function getBackgroundValue(name) {
  if (name.startsWith('backgrounds/')) {
    return `url(${name}) center/cover no-repeat`;
  }
  switch (name) {
    case 'sunset':
      return 'linear-gradient(145deg, #ff9a56 0%, #f43f5e 45%, #7c3aed 100%)';
    case 'ocean':
      return 'linear-gradient(145deg, #219ebc 0%, #023047 45%, #8ecae6 100%)';
    case 'forest':
      return 'linear-gradient(145deg, #1f3f2f 0%, #2d6a4f 45%, #95d5b2 100%)';
    default:
      return getThemeBackground('default');
  }
}

// ================================
// App system and window manager
// ================================
function registerApp(app) {
  if (!app.id || !app.name || typeof app.render !== 'function') {
    console.warn('Invalid app registration:', app);
    return;
  }
  appRegistry.push(app);
  renderAppList();
}


function renderAppList() {
  appList.innerHTML = '';

  appRegistry.forEach((app) => {
    const button = document.createElement('button');
    button.className = 'app-item';
    button.innerHTML = `
      <span class="app-icon">${app.icon || '📦'}</span>
      <span>${app.name}</span>
    `;
    button.addEventListener('click', () => {
      openApp(app.id);
      hideStartMenu();
    });
    appList.appendChild(button);
  });
}

function openApp(appId) {
  const app = appRegistry.find((item) => item.id === appId);
  if (!app) {
    alert(`Uygulama bulunamadı: ${appId}`);
    return;
  }

  if (openWindows[app.id]) {
    bringToFront(openWindows[app.id].element);
    return;
  }

  const windowElement = document.createElement('div');
  windowElement.className = 'window';
  windowElement.style.zIndex = 200;
  windowElement.classList.add('window-opening');
  requestAnimationFrame(() => {
    windowElement.classList.add('window-open');
  });

  const header = document.createElement('div');
  header.className = 'window-header';

  const title = document.createElement('div');
  title.className = 'window-title';
  title.textContent = `${app.icon || ''} ${app.name}`;

  const controls = document.createElement('div');
  controls.className = 'window-controls';

  const fullscreenButton = document.createElement('button');
  fullscreenButton.className = 'window-fullscreen';
  fullscreenButton.textContent = '⛶';
  fullscreenButton.title = 'Tam ekran';
  fullscreenButton.addEventListener('click', () => toggleFullscreen(windowElement));

  const closeButton = document.createElement('button');
  closeButton.className = 'window-close';
  closeButton.textContent = '✕';
  closeButton.addEventListener('click', () => closeApp(app.id));

  controls.appendChild(fullscreenButton);
  controls.appendChild(closeButton);
  header.appendChild(title);
  header.appendChild(controls);

  const content = document.createElement('div');
  content.className = 'window-content';

  windowElement.appendChild(header);
  windowElement.appendChild(content);

  addResizeHandles(windowElement);
  windowContainer.appendChild(windowElement);
  makeWindowDraggable(windowElement, header);
  bringToFront(windowElement);

  app.render(content);
  openWindows[app.id] = { element: windowElement, taskbarButton: createTaskbarButton(app) };
}

function addResizeHandles(windowElement) {
  const directions = ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'];
  directions.forEach((direction) => {
    const handle = document.createElement('div');
    handle.className = `window-resizer window-resizer-${direction}`;
    handle.dataset.direction = direction;
    windowElement.appendChild(handle);
    handle.addEventListener('mousedown', (event) => startResize(event, windowElement, direction));
  });
}

function startResize(event, windowElement, direction) {
  event.stopPropagation();
  if (event.button !== 0) return;

  const rect = windowElement.getBoundingClientRect();
  const startX = event.clientX;
  const startY = event.clientY;
  const startWidth = rect.width;
  const startHeight = rect.height;
  const startLeft = rect.left;
  const startTop = rect.top;

  const minWidth = 240;
  const minHeight = 200;

  function onMouseMove(moveEvent) {
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;

    if (direction.includes('e')) {
      newWidth = Math.max(minWidth, startWidth + dx);
    }
    if (direction.includes('s')) {
      newHeight = Math.max(minHeight, startHeight + dy);
    }
    if (direction.includes('w')) {
      newWidth = Math.max(minWidth, startWidth - dx);
      newLeft = startLeft + dx;
    }
    if (direction.includes('n')) {
      newHeight = Math.max(minHeight, startHeight - dy);
      newTop = startTop + dy;
    }

    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 90;
    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);

    const maxLeft = Math.max(10, window.innerWidth - newWidth - 10);
    const maxTop = Math.max(10, window.innerHeight - newHeight - 90);
    newLeft = Math.min(Math.max(10, newLeft), maxLeft);
    newTop = Math.min(Math.max(10, newTop), maxTop);

    windowElement.style.width = `${newWidth}px`;
    windowElement.style.height = `${newHeight}px`;
    windowElement.style.left = `${newLeft}px`;
    windowElement.style.top = `${newTop}px`;
  }

  function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  event.preventDefault();
}

function toggleFullscreen(windowElement) {
  const isFullscreen = windowElement.dataset.fullscreen === 'true';
  if (isFullscreen) {
    windowElement.dataset.fullscreen = 'false';
    windowElement.style.left = windowElement.dataset.prevLeft || '70px';
    windowElement.style.top = windowElement.dataset.prevTop || '70px';
    windowElement.style.width = windowElement.dataset.prevWidth || '360px';
    windowElement.style.height = windowElement.dataset.prevHeight || '260px';
    windowElement.classList.remove('fullscreen');
  } else {
    const rect = windowElement.getBoundingClientRect();
    windowElement.dataset.prevLeft = `${rect.left}px`;
    windowElement.dataset.prevTop = `${rect.top}px`;
    windowElement.dataset.prevWidth = `${rect.width}px`;
    windowElement.dataset.prevHeight = `${rect.height}px`;
    windowElement.dataset.fullscreen = 'true';
    windowElement.style.left = '10px';
    windowElement.style.top = '10px';
    windowElement.style.width = 'calc(100% - 20px)';
    windowElement.style.height = 'calc(100vh - 82px)';
    windowElement.classList.add('fullscreen');
  }
}

function makeWindowDraggable(windowElement, handle) {
  handle.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;

    const rect = windowElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;

    windowElement.classList.add('dragging');
    bringToFront(windowElement);

    function onMouseMove(moveEvent) {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      windowElement.style.left = `${startLeft + deltaX}px`;
      windowElement.style.top = `${startTop + deltaY}px`;
    }

    function onMouseUp() {
      windowElement.classList.remove('dragging');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    event.preventDefault();
  });
}

function closeApp(appId) {
  const entry = openWindows[appId];
  if (!entry) return;

  entry.element.remove();
  entry.taskbarButton.remove();
  delete openWindows[appId];
}

function bringToFront(element) {
  const windows = windowContainer.querySelectorAll('.window');
  windows.forEach((win) => {
    win.style.zIndex = '200';
  });
  element.style.zIndex = '210';
}

function createTaskbarButton(app) {
  const button = document.createElement('button');
  button.className = 'taskbar-icon active';
  button.title = app.name;
  button.textContent = app.icon || '◼';
  button.addEventListener('click', () => {
    const entry = openWindows[app.id];
    if (entry) {
      bringToFront(entry.element);
    }
  });
  taskbarApps.appendChild(button);
  return button;
}

// ================================
// Built-in apps
// ================================
registerApp({
  id: 'notlar',
  name: 'Notes',
  icon: '📝',
  render(container) {
    // GÜVENLİK KİLİDİ: Eğer sistem container'ı null gönderirse kodu durdur, çökme!
    if (!container) {
      console.warn("Notes is open but system cannot find any container");
      return;
    }

    // 1. Adım: Arayüzü oluşturuyoruz
    container.innerHTML = `
      <div class="app-shell notes-app flex flex-col gap-3 p-4">
        <textarea id="dinamikMetin" class="textarea textarea-bordered h-40 w-full" placeholder="Write your notes here..."></textarea>
        <button id="saveNote" class="btn btn-primary btn-sm md:btn-md w-full sm:w-auto">Save it!</button>
      </div>
    `;

    // 2. Adım: Elemanlar yüklendi, butonu güvenle seçiyoruz
    const saveBtn = container.querySelector('#saveNote');
    
    // Buton hafızada var mı kontrolü (Aşırı güvenlik)
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        const metinElemani = container.querySelector('#dinamikMetin');
        if (!metinElemani) return;
        
        const metin = metinElemani.value;
        
        // 3. Adım: Metni TXT dosyası formatına (Blob) dönüştürün
        const blob = new Blob([metin], { type: 'text/plain;charset=utf-8' });
        
        // 4. Adım: Geçici bir indirme linki oluşturun
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Note.txt';
        
        // 5. Adım: Tetikleyin ve temizleyin
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }
  }
});



registerApp({
  id: 'hesap',
  name: 'Calculator',
  icon: '🧮',
  render(container) {
    container.innerHTML = `
      <div class="app-shell calculator-app">
        <div class="calculator-card">
          <input type="text" class="calc-screen" id="calcScreen" value="0" readonly />
          <div class="calc-grid"></div>
        </div>
      </div>
    `;

    const screen = container.querySelector('#calcScreen');
    const grid = container.querySelector('.calc-grid');
    let value = '0';

    function updateScreen() {
      screen.value = value;
    }

    function press(key) {
      if (key === 'C') {
        value = '0';
      } else if (key === '=') {
        try {
          value = String(eval(value));
        } catch {
          value = 'Hata';
        }
      } else {
        if (value === '0' || value === 'Hata') {
          value = key;
        } else {
          value += key;
        }
      }
      updateScreen();
    }

    const buttons = [
      '7', '8', '9', '/',
      '4', '5', '6', '*',
      '1', '2', '3', '-',
      '0', '.', 'C', '+',
      '='
    ];

    buttons.forEach((key) => {
      const button = document.createElement('button');
      button.className = `calc-button ${key === '=' || ['/', '*', '-', '+'].includes(key) ? 'operator' : ''}`;
      button.textContent = key;
      button.addEventListener('click', () => press(key));
      grid.appendChild(button);
    });
  }
});

function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('clock').innerText = `${hours}:${minutes}:${seconds}`;
            setTimeout(updateClock, 1000);
        }
        updateClock();



// Yeni uygulama eklemek için bu örneği kullanabilirsiniz:
// registerApp({
//   id: 'yeniUygulama',
//   name: 'Yeni Uygulama',
//   icon: '⭐',
//   render(container) {
//     container.innerHTML = '<p>Yeni uygulama içeriği buraya gelir.</p>';
//   }
// });
