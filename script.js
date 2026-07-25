const appRegistry = [];
const openWindows = {};
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const appList = document.getElementById('appList');
const windowContainer = document.getElementById('windowContainer');
const taskbarApps = document.getElementById('taskbarApps');

startButton.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleStartMenu();
});

document.addEventListener('click', (event) => {
  if (!startMenu.contains(event.target)) {
    hideStartMenu();
  }
});

function toggleStartMenu() {
  startMenu.classList.toggle('hidden');
}

function hideStartMenu() {
  startMenu.classList.add('hidden');
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
  header.innerHTML = `
    <div class="window-title">${app.icon || ''} ${app.name}</div>
  `;

  const closeButton = document.createElement('button');
  closeButton.className = 'window-close';
  closeButton.textContent = '✕';
  closeButton.addEventListener('click', () => closeApp(app.id));

  header.appendChild(closeButton);

  const content = document.createElement('div');
  content.className = 'window-content';

  windowElement.appendChild(header);
  windowElement.appendChild(content);

  windowContainer.appendChild(windowElement);
  makeWindowDraggable(windowElement, header);
  bringToFront(windowElement);

  app.render(content);
  openWindows[app.id] = { element: windowElement, taskbarButton: createTaskbarButton(app) };
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

// Yeni uygulama eklemek için bu örneği kullanabilirsiniz:
// registerApp({
//   id: 'yeniUygulama',
//   name: 'Yeni Uygulama',
//   icon: '⭐',
//   render(container) {
//     container.innerHTML = '<p>Yeni uygulama içeriği buraya gelir.</p>';
//   }
// });
