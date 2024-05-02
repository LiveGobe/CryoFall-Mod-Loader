const { contextBridge, ipcRenderer } = require("electron");

// DONT FORGET UPDATE GLOBAL D TS FILE SYKA!

contextBridge.exposeInMainWorld("api", {
    loadConfig: () => ipcRenderer.invoke("api:loadConfig"),
    saveConfig: (conf) => ipcRenderer.invoke("api:saveConfig", conf),
    getModsData: (mode) => ipcRenderer.invoke("api:getModsData", mode),
    setModEnabled: (mode, modID) => ipcRenderer.invoke("api:setModEnabled", mode, modID),
    setModDisabled: (mode, modID) => ipcRenderer.invoke("api:setModDisabled", mode, modID),
    uploadMod: (mode, mod) => ipcRenderer.invoke("api:uploadMod", mode, mod),
    uploadModLink: (mode, link) => ipcRenderer.invoke("api:uploadModLink", mode, link),
    deleteMod: (mode, modID) => ipcRenderer.invoke("api:deleteMod", mode, modID)
});