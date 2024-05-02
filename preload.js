const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("config", {
    load: () => ipcRenderer.invoke("config:load"),
    getXML: (mode) => ipcRenderer.invoke("config:getXML", mode),
    getModData: (mode, mod) => ipcRenderer.invoke("mods:getData", mode, mod)
});