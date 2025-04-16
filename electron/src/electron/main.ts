import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { isDev } from "./util.js";

function createMainWindow() {
  // Kill the default menu (File/Edit/View/etc)
  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 720,
    resizable: false, // no drag‑to‑resize
    maximizable: true, // but still allow Maximize
    minimizable: true, // you can keep or remove minimize
    autoHideMenuBar: true, // hides menu bar; Alt will reveal if you really need it
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
}

app.whenReady().then(createMainWindow);

// On macOS it’s common to re‑create a window in the app when
// the dock icon is clicked and there are no other windows open.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
