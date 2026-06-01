const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lc', {
  pickDir: () => ipcRenderer.invoke('dir:pick'),
  scanDir: (root) => ipcRenderer.invoke('dir:scan', root),
  build: (payload) => ipcRenderer.invoke('context:build', payload),
  copy: (text) => ipcRenderer.invoke('context:copy', text),
  save: (text) => ipcRenderer.invoke('context:save', text)
});
