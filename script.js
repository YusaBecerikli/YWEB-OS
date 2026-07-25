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
    container.innerHTML = `
      <div class="searchBox">
        <input class="searchInput" type="text" placeholder="Search something" aria-label="Search query" />
        <button class="searchButton" type="button" aria-label="Search">🔎</button>
      </div>
      <div class="search-results"></div>
      <div class="search-frame-wrapper hidden">
        <div class="search-frame-header">
          <div class="search-frame-title">RealWebEngine Preview</div>
          <button class="search-frame-close" type="button" aria-label="Close preview">✕</button>
        </div>
        <iframe class="search-frame" src="about:blank"></iframe>
      </div>
    `;

    const input = container.querySelector('.searchInput');
    const button = container.querySelector('.searchButton');
    const results = container.querySelector('.search-results');
    const frameWrapper = container.querySelector('.search-frame-wrapper');
    const frame = container.querySelector('.search-frame');
    const frameClose = container.querySelector('.search-frame-close');

    function openInFrame(url) {
      frame.src = url;
      frameWrapper.classList.remove('hidden');
    }

    frameClose.addEventListener('click', () => {
      frameWrapper.classList.add('hidden');
      frame.src = 'about:blank';
    });

    function createResultCard(title, description, url) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'search-result-card';
      card.innerHTML = `
        <div class="search-result-title">${title}</div>
        <div class="search-result-description">${description}</div>
        <div class="search-result-url">${url}</div>
      `;
      card.addEventListener('click', () => openInFrame(url));
      return card;
    }

    function renderResults(query) {
      const encoded = encodeURIComponent(query);
      results.innerHTML = '';
      const heading = document.createElement('div');
      heading.className = 'search-result-heading';
      heading.textContent = `Showing results for "${query}"`;
      results.appendChild(heading);

      const cards = [
        createResultCard(
          `Search ${query} on Google`,
          'Open a preview of the Google search results inside RealWebEngine.',
          `https://www.google.com/search?q=${encoded}`
        ),
        createResultCard(
          `Search ${query} on DuckDuckGo`,
          'Open a preview of the DuckDuckGo search results inside RealWebEngine.',
          `https://duckduckgo.com/?q=${encoded}`
        ),
        createResultCard(
          `Search ${query} on Bing`,
          'Open a preview of the Bing search results inside RealWebEngine.',
          `https://www.bing.com/search?q=${encoded}`
        )
      ];

      cards.forEach((card) => results.appendChild(card));
    }

    function handleSearch() {
      const query = input.value.trim();
      if (!query) {
        results.innerHTML = '<div class="search-warning">Please enter a search term.</div>';
        return;
      }
      renderResults(query);
    }

    button.addEventListener('click', handleSearch);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    });
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
