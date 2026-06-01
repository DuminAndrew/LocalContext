// LocalContext — Electron main process.
const { app, BrowserWindow, ipcMain, dialog, clipboard, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { scanDir } = require('./src/scanner');
const { buildContext } = require('./src/builder');

const isDev = process.argv.includes('--dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 840, minWidth: 960, minHeight: 600,
    backgroundColor: '#0f1117', title: 'LocalContext', autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  if (isDev) win.webContents.openDevTools({ mode: 'detach' });
}

ipcMain.handle('dir:pick', async () => {
  const r = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('dir:scan', async (_e, root) => {
  try { return { files: await scanDir(root), error: null }; }
  catch (e) { return { files: [], error: String(e && e.message || e) }; }
});

ipcMain.handle('context:build', async (_e, { root, rels, format }) => {
  try { return await buildContext(root, rels, format); }
  catch (e) { return { text: '', tokens: 0, chars: 0, included: 0, error: String(e && e.message || e) }; }
});

ipcMain.handle('context:copy', async (_e, text) => { clipboard.writeText(String(text || '')); return true; });

ipcMain.handle('context:save', async (_e, text) => {
  const r = await dialog.showSaveDialog({ defaultPath: 'context.md', filters: [{ name: 'Markdown/Text', extensions: ['md', 'txt', 'xml'] }] });
  if (r.canceled || !r.filePath) return false;
  fs.writeFileSync(r.filePath, String(text || ''), 'utf8');
  return r.filePath;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
