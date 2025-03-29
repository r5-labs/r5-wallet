import { app, BrowserWindow, Menu } from 'electron';

function createBrowserWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: { nodeIntegration: false }
  });

  // Remove menu bar
  //win.setMenu(null);

  // Load React app from localhost
  setImmediate(() => { 
    win.loadURL('http://localhost:3000'); 
  });
}

app.whenReady().then(() => {
  createBrowserWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createBrowserWindow();
    }
  });
});

// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
