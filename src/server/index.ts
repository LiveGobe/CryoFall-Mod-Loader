import { app, BrowserWindow, ipcMain } from "electron"
import path from "node:path"
import { Config } from "./api/config"
import { Mod } from "./api/mod"
import { ModList } from "./api/mods"
import { ModsConfig } from "./api/mods-config"

if (process.env.NODE_ENV !== 'production') {
    try {
        module.filename = __filename
        require('electron-reloader')(module, { debug: true, watchRenderer: true })
    } catch (e) {
        console.error(e)
    }
}

const main = () => {
    const win = new BrowserWindow({
        width: 1600,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
        },
        autoHideMenuBar: true,
    })
    win.loadFile("ui/index.html")
}

app.whenReady().then(() => {
    ipcMain.handle('CryoFallModLoader.Config.load', (_, ...args: Parameters<typeof Config.load>) => Config.load(...args))
    ipcMain.handle('CryoFallModLoader.Config.save', (_, ...args: Parameters<typeof Config.save>) => Config.save(...args))
    ipcMain.handle('CryoFallModLoader.Mod.load', (_, ...args: Parameters<typeof Mod.load>) => Mod.load(...args))
    ipcMain.handle('CryoFallModLoader.Mod.saveFromFile', (_, ...args: Parameters<typeof Mod.saveFromFile>) => Mod.saveFromFile(...args))
    ipcMain.handle('CryoFallModLoader.Mod.saveFromUrl', (_, ...args: Parameters<typeof Mod.saveFromUrl>) => Mod.saveFromUrl(...args))
    ipcMain.handle('CryoFallModLoader.ModList.delete', (_, ...args: Parameters<typeof ModList.delete>) => ModList.delete(...args))
    ipcMain.handle('CryoFallModLoader.ModList.disable', (_, ...args: Parameters<typeof ModList.disable>) => ModList.disable(...args))
    ipcMain.handle('CryoFallModLoader.ModList.enable', (_, ...args: Parameters<typeof ModList.enable>) => ModList.enable(...args))
    ipcMain.handle('CryoFallModLoader.ModList.load', (_, ...args: Parameters<typeof ModList.load>) => ModList.load(...args))
    ipcMain.handle('CryoFallModLoader.ModsConfig.load', (_, ...args: Parameters<typeof ModsConfig.load>) => ModsConfig.load(...args))
    ipcMain.handle('CryoFallModLoader.ModsConfig.save', (_, ...args: Parameters<typeof ModsConfig.save>) => ModsConfig.save(...args))

    main()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length == 0) main()
    })
})

app.on("window-all-closed", () => {
    if (process.platform != "darwin") app.quit()
})