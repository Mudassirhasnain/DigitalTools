import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
const nextArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--host') {
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      nextArgs.push('-H', rawArgs[i + 1]);
      i++;
    } else {
      nextArgs.push('-H', '0.0.0.0');
    }
  } else if (arg.startsWith('--host=')) {
    nextArgs.push('-H', arg.split('=')[1]);
  } else if (arg === '--port') {
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      nextArgs.push('-p', rawArgs[i + 1]);
      i++;
    }
  } else if (arg.startsWith('--port=')) {
    nextArgs.push('-p', arg.split('=')[1]);
  } else {
    nextArgs.push(arg);
  }
}

// Ensure default port and host if not already set
if (!nextArgs.includes('-p')) {
  nextArgs.unshift('-p', '3000');
}
if (!nextArgs.includes('-H')) {
  nextArgs.unshift('-H', '0.0.0.0');
}

const child = spawn('npx', ['next', 'dev', ...nextArgs], {
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
