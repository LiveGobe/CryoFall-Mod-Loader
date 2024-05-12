const { contextBridge, ipcRenderer } = require("electron");

// DONT FORGET UPDATE GLOBAL D TS FILE SYKA!

enum LaunchType {
    client = 'client',
    server = 'server',
    editor = 'editor',
}

const cryoFallModLoader: typeof CryoFallModLoader = {
    LaunchType: LaunchType,
    Config: {
        load(...args) { return ipcRenderer.invoke('CryoFallModLoader.Config.load', ...args) },
        save(...args) { return ipcRenderer.invoke('CryoFallModLoader.Config.save', ...args) },
    },
    Mod: {
        load(...args) { return ipcRenderer.invoke('CryoFallModLoader.Mod.load', ...args) },
        saveFromFile(...args) { return ipcRenderer.invoke('CryoFallModLoader.Mod.saveFromFile', ...args) },
        saveFromUrl(...args) { return ipcRenderer.invoke('CryoFallModLoader.Mod.saveFromUrl', ...args) },
    },
    ModList: {
        load(...args) { return ipcRenderer.invoke('CryoFallModLoader.ModList.load', ...args) },
        enable(...args) { return ipcRenderer.invoke('CryoFallModLoader.ModList.enable', ...args) },
        disable(...args) { return ipcRenderer.invoke('CryoFallModLoader.ModList.disable', ...args) },
        delete(...args) { return ipcRenderer.invoke('CryoFallModLoader.ModList.delete', ...args) },
    },
}

contextBridge.exposeInMainWorld("CryoFallModLoader", cryoFallModLoader);