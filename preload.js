const { contextBridge, ipcRenderer } = require("electron");

// DONT FORGET UPDATE GLOBAL D TS FILE SYKA!

contextBridge.exposeInMainWorld("CryoFallModLoader", {
    LaunchType: Object.freeze({
        client: 'client',
        server: 'server',
        editor: 'editor',
    }),
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
        load(...args) { console.log('load', ...args); return ipcRenderer.invoke('CryoFallModLoader.ModList.load', ...args) },
        enable(...args) { console.log('enable', ...args); return ipcRenderer.invoke('CryoFallModLoader.ModList.enable', ...args) },
        disable(...args) { console.log('disable', ...args); return ipcRenderer.invoke('CryoFallModLoader.ModList.disable', ...args) },
        delete(...args) { console.log('delete', ...args); return ipcRenderer.invoke('CryoFallModLoader.ModList.delete', ...args) },
    },
});