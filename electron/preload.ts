import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('api', {
  // Secure Electron APIs definition
});
