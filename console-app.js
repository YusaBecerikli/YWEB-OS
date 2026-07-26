(function () {
  // ================================
  // Console app module
  // ================================
  function createConsoleShell() {
    const commands = {};
    const outputLines = [];
    let currentState = {
      counter: 0
    };

    // ================================
    // Command registry
    // ================================
    function registerCommand(name, handler) {
      commands[name.toLowerCase()] = handler;
    }

    function print(output, type = 'info') {
      const line = document.createElement('div');
      line.className = `console-line ${type}`;
      line.textContent = output;
      outputLines.push(line);
      return line;
    }

    function runCommand(input, outputElement) {
      const raw = input.trim();
      if (!raw) return;

      const line = print(`guest@yweb:~$ ${raw}`);
      outputElement.appendChild(line);

      const [name, ...args] = raw.split(/\s+/);
      const commandName = name.toLowerCase();
      const handler = commands[commandName];

      if (!handler) {
        const errorLine = print(`Command not found: ${commandName}`, 'error');
        outputElement.appendChild(errorLine);
        return;
      }

      try {
        const result = handler(args, {
          state: currentState,
          registerCommand,
          commands: Object.keys(commands).sort(),
          print: (message, type = 'info') => {
            const msgLine = print(message, type);
            outputElement.appendChild(msgLine);
          }
        });

        if (result !== undefined) {
          const resultLine = print(String(result), 'success');
          outputElement.appendChild(resultLine);
        }
      } catch (error) {
        const errorLine = print(`Error: ${error.message}`, 'error');
        outputElement.appendChild(errorLine);
      }

      outputElement.scrollTop = outputElement.scrollHeight;
    }

    // ================================
    // Console UI and shell rendering
    // ================================
    function render(container) {
      container.innerHTML = `
        <div class="console-app">
          <div class="console-header">
            <div>
              <div class="console-title">Developer Console</div>
              <div class="console-subtitle">Type commands and extend them freely</div>
            </div>
            <div class="console-status">Ready</div>
          </div>
          <div class="console-output" tabindex="0"></div>
          <div class="console-input-row">
            <span class="console-prompt">guest@yweb:~$</span>
            <input class="console-input" type="text" autocomplete="off" spellcheck="false" />
          </div>
        </div>
      `;

      const output = container.querySelector('.console-output');
      const input = container.querySelector('.console-input');
      const shell = container.querySelector('.console-app');

      container.style.height = '100%';
      shell.style.height = '100%';
      shell.style.minHeight = '320px';
      shell.style.maxHeight = '460px';

      function write(message, type = 'info') {
        const line = print(message, type);
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
      }

      write('YWEB Console initialized.');
      write('Type "help" to view available commands.');

      registerCommand('help', () => {
        return `Available commands: ${Object.keys(commands).sort().join(', ')}`;
      });

      registerCommand('clear', () => {
        output.innerHTML = '';
        return undefined;
      });

      registerCommand('echo', (args) => args.join(' '));
      registerCommand('date', () => new Date().toString());
      registerCommand('add', (args) => {
        const values = args.map(Number).filter((value) => !Number.isNaN(value));
        if (values.length < 2) {
          return 'Usage: add <number> <number>';
        }
        return values.reduce((sum, value) => sum + value, 0);
      });
      registerCommand('set', (args) => {
        if (args.length < 2) {
          return 'Usage: set <key> <value>';
        }
        const [key, ...valueParts] = args;
        currentState[key] = valueParts.join(' ');
        return `Set ${key} = ${currentState[key]}`;
      });
      registerCommand('get', (args) => {
        if (!args[0]) {
          return 'Usage: get <key>';
        }
        return currentState[args[0]] ?? 'undefined';
      });

      // You can add new commands here.
      // Example:
      // registerCommand('greet', (args) => `Hello ${args.join(' ') || 'world'}`);

      function refreshConsoleLayout() {
        const shellRect = shell.getBoundingClientRect();
        const headerHeight = container.querySelector('.console-header').offsetHeight;
        const inputHeight = container.querySelector('.console-input-row').offsetHeight;
        const shellHeight = Math.max(320, shellRect.height || 320);
        const availableHeight = Math.max(180, shellHeight - headerHeight - inputHeight - 24);
        output.style.minHeight = `${availableHeight}px`;
        output.style.maxHeight = `${availableHeight}px`;
      }

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          runCommand(input.value, output);
          input.value = '';
          requestAnimationFrame(refreshConsoleLayout);
        }
      });

      // Keep the console output pane bounded so it scrolls instead of growing forever.
      const resizeObserver = new ResizeObserver(() => refreshConsoleLayout());
      resizeObserver.observe(shell);
      requestAnimationFrame(refreshConsoleLayout);
      input.focus();
    }

    return {
      render,
      registerCommand,
      runCommand
    };
  }

  const consoleShell = createConsoleShell();

  // ================================
  // Register the console as a desktop app
  // ================================

  window.YWEBConsole = {
    createConsoleShell,
    registerCommand: consoleShell.registerCommand,
    runCommand: consoleShell.runCommand
  };

  registerApp({
    id: 'console',
    name: 'Console',
    icon: '⌨',
    render(container) {
      consoleShell.render(container);
    }
  });
})();
