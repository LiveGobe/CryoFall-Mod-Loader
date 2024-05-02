const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("config", {
    load: () => ipcRenderer.invoke("config:load"),
    save: (conf) => ipcRenderer.invoke("config:save", conf),
    getModsData: (mode) => ipcRenderer.invoke("config:getModsData", mode),
    setModEnabled: (mode, modID) => ipcRenderer.invoke("config:setModEnabled", mode, modID),
    setModDisabled: (mode, modID) => ipcRenderer.invoke("config:setModDisabled", mode, modID),
    uploadMod: (mode, mod) => ipcRenderer.invoke("config:uploadMod", mode, mod),
    uploadModLink: (mode, link) => ipcRenderer.invoke("config:uploadModLink", mode, link)
});