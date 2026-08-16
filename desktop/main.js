const { app, BrowserWindow, Menu, shell, session } = require('electron');
const path = require('path');

const LIVE_ADMIN_URL = process.env.TURIZM_APP_URL || 'https://www.hazeynturizm.com/admin.html?desktop=1';
const APP_ORIGIN = 'https://www.hazeynturizm.com';

// Bazı Windows ekran kartı / ölçeklendirme kombinasyonlarında Chromium'un
// tıklama hedefi ile görünen alan kısa süreli ayrışabiliyor. Muhasebe ekranı
// grafik ağırlıklı olmadığı için kararlı form etkileşimini önceliklendiriyoruz.
app.disableHardwareAcceleration();

function isInternalAdminUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === APP_ORIGIN && (url.pathname === '/admin' || url.pathname === '/admin.html');
  } catch (error) {
    return false;
  }
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: 'Hazeyn & Hakikat Turizm Muhasebe',
    icon: path.join(__dirname, 'assets', 'app-icon.png'),
    backgroundColor: '#090a0d',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      nativeWindowOpen: true,
      backgroundThrottling: false
    }
  });

  window.once('ready-to-show', () => window.show());
  window.on('focus', () => {
    if (!window.isDestroyed()) window.webContents.focus();
  });
  window.loadURL(LIVE_ADMIN_URL);

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank' || url.startsWith('blob:') || url.startsWith('data:')) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          width: 980,
          height: 900,
          webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
        }
      };
    }
    shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });

  window.webContents.on('will-navigate', (event, url) => {
    if (isInternalAdminUrl(url)) return;
    event.preventDefault();
    shell.openExternal(url).catch(() => {});
  });

  window.webContents.on('did-fail-load', (_event, errorCode, _description, validatedUrl, isMainFrame) => {
    if (!isMainFrame || errorCode === -3 || validatedUrl.startsWith('file:')) return;
    window.loadFile(path.join(__dirname, 'offline.html'));
  });

  return window;
}

app.setAppUserModelId('com.hazeynhakikat.turizmmuhasebe');
app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  createMainWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
