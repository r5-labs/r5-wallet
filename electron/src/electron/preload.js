const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("openExternal", (url) =>
  ipcRenderer.send("open-external", url)
);