import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import * as esbuild from 'esbuild';
import { generateAllIcons } from './generate-icons.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const tmpBuildDir = path.join(distDir, '.tmp-build');
const chromeDistDir = path.join(distDir, 'chrome-dist');
const firefoxDistDir = path.join(distDir, 'firefox-dist');

const extensionDir = path.join(rootDir, 'extension');
const chromeManifestSrc = path.join(extensionDir, 'manifest.chrome.json');
const firefoxManifestSrc = path.join(extensionDir, 'manifest.firefox.json');
const serviceWorkerSrc = path.join(extensionDir, 'background', 'service-worker.ts');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    const parentDir = path.dirname(dest);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

async function buildExtension() {
  console.log('🚀 Starting Manifest V3 Browser Extension Build Pipeline...');

  // 1. Ensure icons exist in public/icons
  const publicIconsDir = path.join(rootDir, 'public', 'icons');
  console.log('📦 Step 1: Generating WebExtension icons (16, 32, 48, 128)...');
  generateAllIcons(publicIconsDir);

  // 2. Clean previous dist
  console.log('🧹 Step 2: Cleaning output directories...');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // 3. Build React Web App with Vite into temporary folder
  console.log('⚡ Step 3: Compiling React Application with Vite...');
  try {
    execSync(`npx vite build --outDir "${tmpBuildDir}"`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch (err) {
    console.error('❌ Vite build failed:', err);
    process.exit(1);
  }

  // 4. Compile background service worker with esbuild
  console.log('🛠️  Step 4: Compiling Background Service Worker...');
  const compiledServiceWorkerPath = path.join(distDir, 'service-worker.js');
  try {
    await esbuild.build({
      entryPoints: [serviceWorkerSrc],
      bundle: true,
      outfile: compiledServiceWorkerPath,
      platform: 'browser',
      target: 'es2020',
      format: 'esm',
      minify: true,
    });
    console.log('✅ Service worker compiled successfully');
  } catch (err) {
    console.error('❌ Service worker compilation failed:', err);
    process.exit(1);
  }

  // 5. Create Chrome Distribution
  console.log('🌐 Step 5: Assembling Chrome Extension (dist/chrome-dist)...');
  if (fs.existsSync(chromeDistDir)) fs.rmSync(chromeDistDir, { recursive: true, force: true });
  fs.mkdirSync(chromeDistDir, { recursive: true });
  copyRecursiveSync(tmpBuildDir, chromeDistDir);
  fs.copyFileSync(chromeManifestSrc, path.join(chromeDistDir, 'manifest.json'));
  fs.copyFileSync(compiledServiceWorkerPath, path.join(chromeDistDir, 'service-worker.js'));

  // Ensure icons are copied directly
  copyRecursiveSync(publicIconsDir, path.join(chromeDistDir, 'icons'));

  // 6. Create Firefox Distribution
  console.log('🦊 Step 6: Assembling Firefox Extension (dist/firefox-dist)...');
  if (fs.existsSync(firefoxDistDir)) fs.rmSync(firefoxDistDir, { recursive: true, force: true });
  fs.mkdirSync(firefoxDistDir, { recursive: true });
  copyRecursiveSync(tmpBuildDir, firefoxDistDir);
  fs.copyFileSync(firefoxManifestSrc, path.join(firefoxDistDir, 'manifest.json'));
  fs.copyFileSync(compiledServiceWorkerPath, path.join(firefoxDistDir, 'service-worker.js'));

  // Ensure icons are copied directly
  copyRecursiveSync(publicIconsDir, path.join(firefoxDistDir, 'icons'));

  // 7. Cleanup temp build artifacts
  if (fs.existsSync(tmpBuildDir)) {
    fs.rmSync(tmpBuildDir, { recursive: true, force: true });
  }
  if (fs.existsSync(compiledServiceWorkerPath)) {
    fs.rmSync(compiledServiceWorkerPath, { force: true });
  }

  // 8. Validate output distributions
  console.log('🔍 Step 7: Validating generated extension bundles...');
  validateDistribution('Chrome', chromeDistDir);
  validateDistribution('Firefox', firefoxDistDir);

  console.log('\n🎉 Extension Build Complete!');
  console.log('--------------------------------------------------');
  console.log('📁 Chrome Extension:  dist/chrome-dist');
  console.log('📁 Firefox Extension: dist/firefox-dist');
  console.log('--------------------------------------------------');
}

function validateDistribution(name, dirPath) {
  const manifestPath = path.join(dirPath, 'manifest.json');
  const indexHtmlPath = path.join(dirPath, 'index.html');
  const assetsDirPath = path.join(dirPath, 'assets');
  const iconsDirPath = path.join(dirPath, 'icons');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`[${name}] Missing manifest.json in ${dirPath}`);
  }
  if (!fs.existsSync(indexHtmlPath)) {
    throw new Error(`[${name}] Missing index.html in ${dirPath}`);
  }
  if (!fs.existsSync(assetsDirPath)) {
    throw new Error(`[${name}] Missing assets directory in ${dirPath}`);
  }
  if (!fs.existsSync(iconsDirPath)) {
    throw new Error(`[${name}] Missing icons directory in ${dirPath}`);
  }

  // Verify valid JSON
  const rawManifest = fs.readFileSync(manifestPath, 'utf8');
  let parsedManifest;
  try {
    parsedManifest = JSON.parse(rawManifest);
  } catch (err) {
    throw new Error(`[${name}] manifest.json is not valid JSON: ${err.message}`);
  }

  if (parsedManifest.manifest_version !== 3) {
    throw new Error(`[${name}] Expected Manifest V3, got ${parsedManifest.manifest_version}`);
  }

  if (parsedManifest.chrome_url_overrides?.newtab !== 'index.html') {
    throw new Error(`[${name}] New tab override not pointing to index.html`);
  }

  // Check required icons
  const requiredSizes = ['16', '32', '48', '128'];
  for (const s of requiredSizes) {
    const iconFile = path.join(iconsDirPath, `icon${s}.png`);
    if (!fs.existsSync(iconFile)) {
      throw new Error(`[${name}] Missing icon: icons/icon${s}.png`);
    }
  }

  // Check that temporary source manifest names are NOT present in final dist
  if (fs.existsSync(path.join(dirPath, 'manifest.chrome.json')) || fs.existsSync(path.join(dirPath, 'manifest.firefox.json'))) {
    throw new Error(`[${name}] Source manifest names detected in final output!`);
  }

  console.log(` ✅ ${name} MV3 Extension validated successfully (${dirPath})`);
}

buildExtension().catch((err) => {
  console.error('❌ Build failed with error:', err);
  process.exit(1);
});
