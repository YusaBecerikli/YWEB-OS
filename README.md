# YWEB-OS

This project contains a basic web-based operating system (WEB-OS) starter structure.

## Contents

- `index.html`: Main interface and desktop structure.
- `style.css`: Basic styling and window design.
- `script.js`: App registration system, main menu, and window management.

## How it works

1. You can open the main app menu with the `startButton`.
2. Example apps are registered in `script.js` using `registerApp(...)` calls.
3. `openApp(appId)` opens an app window, and it can be closed with the window close button.

## Adding a new app

Use the `registerApp` function inside `script.js` to add a new app:

```js
registerApp({
  id: 'newApp',
  name: 'New App',
  icon: '⭐',
  render(container) {
    container.innerHTML = '<p>New app content goes here.</p>';
  }
});
```

- `id`: A unique identifier for the app.
- `name`: The name shown in the menu.
- `icon`: The icon shown in the menu (emoji or short text).
- `render(container)`: A function that runs when the app opens. You can add HTML content inside `container`.

## Running

You can run these files by opening `index.html` in a browser.
