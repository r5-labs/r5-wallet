import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function createMainWindow() {
    // Kill the default menu (File/Edit/View/etc)
    Menu.setApplicationMenu(null);
    const mainWindow = new BrowserWindow({
        width: 1100,
        height: 720,
        resizable: false, // no drag‑to‑resize
        maximizable: true, // but still allow Maximize
        minimizable: true, // can minimise
        autoHideMenuBar: true,
        icon: path.join(app.getAppPath(), "window-icon.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });
    mainWindow.webContents.setWindowOpenHandler(({}) => {
        return {
            action: "allow",
            overrideBrowserWindowOptions: {
                show: false
            }
        };
    });
    app.on("browser-window-created", (_e, window) => {
        if (window !== mainWindow) {
            window.maximize();
            window.show();
        }
    });
    if (isDev()) {
        mainWindow.loadURL("http://localhost:5123");
    }
    else {
        mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
    }
}
ipcMain.on("open-external", (_event, url) => {
    shell.openExternal(url);
});
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
