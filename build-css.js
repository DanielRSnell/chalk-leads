import { execSync } from 'child_process';
import { mkdirSync, statSync } from 'fs';

async function buildCSS() {
  try {
    console.log('Building Tailwind CSS using Vite...');
    
    // Ensure dist/css directory exists
    mkdirSync('dist/css', { recursive: true });
    
    // Use Vite to build CSS with Tailwind
    const command = 'vite build --config vite.config.css.js';
    
    console.log('Running:', command);
    execSync(command, { stdio: 'inherit' });
    
    // Check file size
    const stats = statSync('dist/css/main.css');
    
    console.log('✅ Tailwind CSS built successfully!');
    console.log(`📁 Output: dist/css/main.css (${stats.size} bytes)`);
    
  } catch (error) {
    console.error('❌ Error building CSS:', error);
    process.exit(1);
  }
}

buildCSS();