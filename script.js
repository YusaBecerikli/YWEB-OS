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
const themeButtons = document.querySelectorAll('.theme-button');
const backgroundButtons = document.querySelectorAll('.background-button');
const customBackgroundInput = document.getElementById('customBackgroundInput');
const desktopElement = document.getElementById('desktop');

document.body.classList.add('theme-default');
desktopElement.style.background = getThemeBackground('default');

startButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleStartMenu();
});

settingsButton.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

settingsClose.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.body.classList.remove('theme-default', 'theme-cobalt', 'theme-sunset', 'theme-forest');
    document.body.classList.add(`theme-${button.dataset.theme}`);
    desktopElement.style.background = getThemeBackground(button.dataset.theme);
  });
});

backgroundButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.body.classList.remove('theme-default', 'theme-cobalt', 'theme-sunset', 'theme-forest');
    document.body.classList.add('theme-default');
    const backgroundValue = button.dataset.background;
    if (backgroundValue.startsWith('backgrounds/')) {
      desktopElement.style.background = `url(${backgroundValue}) center/cover no-repeat`;
    } else {
      desktopElement.style.background = getBackgroundValue(backgroundValue);
    }
  });
});

customBackgroundInput.addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  desktopElement.style.background = `url(${url}) center/cover no-repeat`;
});

document.addEventListener('click', (event) => {
  if (!startMenu.contains(event.target)) {
    hideStartMenu();
  }
  if (!settingsModal.contains(event.target) && event.target !== settingsButton) {
    if (!settingsModal.classList.contains('hidden')) {
      settingsModal.classList.add('hidden');
    }
  }
});

function toggleStartMenu() {
  startMenu.classList.toggle('hidden');
}

function hideStartMenu() {
  startMenu.classList.add('hidden');
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

// Temel uygulama örnekleri
registerApp({
  id: 'notlar',
  name: 'Notes',
  icon: '📝',
  render(container) {
    container.innerHTML = `
      <p>This area is ready for taking notes. You can display application content here.</p>
      <textarea placeholder="Write your notes here..."></textarea>
    `;
  }
});

registerApp({
  id: 'hesap',
  name: 'Calculator',
  icon: '🧮',
  render(container) {
    container.innerHTML = `
      <div class="app-title">Simple Calculator</div>
      <input type="text" class="calc-screen" id="calcScreen" value="0" readonly />
      <div class="calc-grid"></div>
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



registerApp({
    id: 'RealWebEngine',
    name: 'RealWebEngine',
    icon: '⭐',
    render(container) {
        container.innerHTML = ' <div class="searchBox"><input class="searchInput" type="text" name="" placeholder="Search something"><button class="searchButton" href="#"><svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none"><g clip-path="url(#clip0_2_17)"><g filter="url(#filter0_d_2_17)"><path d="M23.7953 23.9182L19.0585 19.1814M19.0585 19.1814C19.8188 18.4211 20.4219 17.5185 20.8333 16.5251C21.2448 15.5318 21.4566 14.4671 21.4566 13.3919C21.4566 12.3167 21.2448 11.252 20.8333 10.2587C20.4219 9.2653 19.8188 8.36271 19.0585 7.60242C18.2982 6.84214 17.3956 6.23905 16.4022 5.82759C15.4089 5.41612 14.3442 5.20435 13.269 5.20435C12.1938 5.20435 11.1291 5.41612 10.1358 5.82759C9.1424 6.23905 8.23981 6.84214 7.47953 7.60242C5.94407 9.13789 5.08145 11.2204 5.08145 13.3919C5.08145 15.5634 5.94407 17.6459 7.47953 19.1814C9.01499 20.7168 11.0975 21.5794 13.269 21.5794C15.4405 21.5794 17.523 20.7168 19.0585 19.1814Z" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" shape-rendering="crispEdges"></path></g></g><defs><filter id="filter0_d_2_17" x="-0.418549" y="3.70435" width="29.7139" height="29.7139" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="4"></feOffset><feGaussianBlur stdDeviation="2"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_17"></feBlend><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_17" result="shape"></feBlend></filter><clipPath id="clip0_2_17"><rect width="28.0702" height="28.0702" fill="white" transform="translate(0.403503 0.526367)"></rect></clipPath></defs></svg></button></div>';
  }
});

// Yeni uygulama eklemek için bu örneği kullanabilirsiniz:
// registerApp({
//   id: 'yeniUygulama',
//   name: 'Yeni Uygulama',
//   icon: '⭐',
//   render(container) {
//     container.innerHTML = '<p>Yeni uygulama içeriği buraya gelir.</p>';
//   }
// });
