/**
 * Priprema www/ za Capacitor — kopira samo web PWA fajlove.
 * Ne dira izvorni tree (PWA i GitHub Pages ostaju netaknuti).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const ROOT_FILES = [
  'index.html',
  'splash.html',
  'landing.html',
  'presents.html',
  'manifest.json',
  'sw.js',
  'config.js',
  'config.example.js'
];

const DIRS = ['pages', 'css', 'js', 'assets'];

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (name === '.gitkeep') continue;
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

rmDir(WWW);
fs.mkdirSync(WWW, { recursive: true });

let copied = 0;
for (const file of ROOT_FILES) {
  const src = path.join(ROOT, file);
  if (!fs.existsSync(src)) {
    console.warn(`[prepare-www] skip missing: ${file}`);
    continue;
  }
  copyRecursive(src, path.join(WWW, file));
  copied += 1;
}

for (const dir of DIRS) {
  const src = path.join(ROOT, dir);
  if (!fs.existsSync(src)) {
    console.warn(`[prepare-www] skip missing dir: ${dir}`);
    continue;
  }
  copyRecursive(src, path.join(WWW, dir));
  copied += 1;
}

console.log(`[prepare-www] Ready: ${WWW} (${copied} roots/dirs)`);
