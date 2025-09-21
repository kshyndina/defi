const { spawn } = require('child_process');
const { config } = require('dotenv');

// Load environment variables from .env.local
config({ path: '.env.local' });

// Run the Next.js build
const buildProcess = spawn('npx', ['next', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('exit', (code) => {
  process.exit(code);
});

buildProcess.on('error', (err) => {
  console.error('Failed to start build process:', err);
  process.exit(1);
});