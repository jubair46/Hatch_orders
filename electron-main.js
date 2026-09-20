const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  const isOwner = process.argv.includes('--app=owner');
  const targetUrl = isOwner ? 'http://localhost:3001/admin' : 'http://localhost:3001';
  const appTitle = isOwner ? 'Hatch Partner & Kitchen POS Console' : 'Hatch — Food Delivery & Dining';

  mainWindow = new BrowserWindow({
    width: isOwner ? 1400 : 1280,
    height: isOwner ? 900 : 820,
    minWidth: 900,
    minHeight: 600,
    title: appTitle,
    backgroundColor: isOwner ? '#09100d' : '#080c0a',
    icon: path.join(__dirname, 'icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL(targetUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
