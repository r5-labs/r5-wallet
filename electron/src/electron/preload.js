const { contextBridge, shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  shell: {
    openExternal: (url) => shell.openExternal(url),
  },
});