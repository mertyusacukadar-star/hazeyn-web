const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const manifest = JSON.parse(read('public/manifest.webmanifest'));
const admin = read('public/admin.html');
const app = read('public/app.js');
const worker = read('public/service-worker.js');

assert.strictEqual(manifest.display, 'standalone');
assert.strictEqual(manifest.start_url, '/admin.html?mobile=1');
assert(manifest.icons.some(icon => icon.sizes === '192x192'));
assert(manifest.icons.some(icon => icon.sizes === '512x512'));
assert(admin.includes('rel="manifest"'));
assert(admin.includes('apple-mobile-web-app-capable'));
assert(app.includes("const IS_MOBILE_APP = page === 'admin' && appQuery.get('mobile') === '1';"));
assert(app.includes("navigator.serviceWorker.register('/service-worker.js')"));
assert(worker.includes("url.pathname.startsWith('/api/')"), 'API ve muhasebe verileri önbelleğe alınmamalı');

function pngDimensions(relativePath) {
  const bytes = fs.readFileSync(path.join(root, relativePath));
  assert.strictEqual(bytes.toString('ascii', 1, 4), 'PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

assert.deepStrictEqual(pngDimensions('public/assets/mobile-app-icon-180.png'), { width: 180, height: 180 });
assert.deepStrictEqual(pngDimensions('public/assets/mobile-app-icon-192.png'), { width: 192, height: 192 });
assert.deepStrictEqual(pngDimensions('public/assets/mobile-app-icon-512.png'), { width: 512, height: 512 });

console.log('mobile-pwa tests passed');
