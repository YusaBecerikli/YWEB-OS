(function () {
  function createConsoleShell() {
    const commands = {};
    const outputLines = [];
    let currentState = {
      counter: 0
    };

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
          <div class="console-output"></div>
          <div class="console-input-row">
            <span class="console-prompt">guest@yweb:~$</span>
            <input class="console-input" type="text" autocomplete="off" spellcheck="false" />
          </div>
        </div>
      `;

      const output = container.querySelector('.console-output');
      const input = container.querySelector('.console-input');

      function write(message, type = 'info') {
        const line = print(message, type);
        output.appendChild(line);
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

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          runCommand(input.value, output);
          input.value = '';
        }
      });

      input.focus();
    }

    return {
      render,
      registerCommand,
      runCommand
    };
  }

  const consoleShell = createConsoleShell();

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
