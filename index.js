const { app, BrowserWindow, ipcMain } = require("electron")
const { XMLParser, XMLBuilder } = require("fast-xml-parser")
const jszip = require("jszip")
const path = require("node:path")
const fs = require("node:fs")

try {
    require('electron-reloader')(module, { debug: true, watchRenderer: true })
} catch (e) {
    console.error(e)
}

let config = {
    folderpaths: {
        client: path.join(process.env.HOME, "Documents\\AtomicTorchStudio\\CryoFall"),
        editor: path.join(process.env.HOME, "Documents\\AtomicTorchStudio\\CryoFall Editor"),
        server: ""
    }
}

function loadConfigJson() {
    if (fs.existsSync("./config.json")) {
        try {
            config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")))
        } catch (e) {
            console.error(e)
        }
    }
    if (!fs.existsSync(config.folderpaths.client)) {
        if (!fs.existsSync(path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall"))) {
            config.folderpaths.client = ""
        }
        else {
            config.folderpaths.client = path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall")
        }
    }

    if (!fs.existsSync(config.folderpaths.editor)) {
        if (!fs.existsSync(path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall Editor"))) {
            config.folderpaths.editor = ""
        }
        else {
            config.folderpaths.editor = path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall Editor")
        }
    }
    return config
}

if (require('electron-squirrel-startup')) app.quit()

function getModsConfigPath(mode) {
    return path.join(config.folderpaths[mode], "ModsConfig.xml")
}

function getModPath(mode, modID) {
    return path.join(config.folderpaths[mode], "Mods", modID + ".mpk")
}

const main = () => {
    const win = new BrowserWindow({ width: 1600, height: 1000, webPreferences: { preload: path.join(__dirname, "preload.js") }, autoHideMenuBar: true })
    win.loadFile("ui/index.html")
}

app.whenReady().then(() => {
    ipcMain.handle("api:loadConfig", () => loadConfigJson())

    ipcMain.handle("api:saveConfig", (_, conf) => {
        try {
            if (!fs.existsSync(conf.folderpaths.client)) {
                throw new Error('client folder fot specified')
            }
            if (!fs.existsSync(conf.folderpaths.editor)) {
                throw new Error('editor folder fot specified')
            }
            fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(conf, null, 2));
        } catch (e) {
            return { success: false, errmsg: e.toString() }
        }

        return { success: true }
    })

    ipcMain.handle("api:getModsData", async (_, mode) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const zip = new jszip()

        const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))
        const enabledMods = Array.isArray(modsConfig.mods.mod) ? modsConfig.mods.mod : [modsConfig.mods.mod].filter(Boolean)

        let mods = [];
        fs.readdirSync(path.join(config.folderpaths[mode], "Mods")).forEach(mod => {
            if (!mod.endsWith(".mpk")) return
            mods.push(new Promise((resolve, reject) => {
                const buffer = fs.readFileSync(path.join(config.folderpaths[mode], "Mods", mod))
                zip.loadAsync(buffer).then(zipFiles => {
                    zipFiles.file("Header.xml").async("string").then(readMod => {
                        const parsedMod = parser.parse(readMod)

                        parsedMod.root.enabled = enabledMods.find(i => i.startsWith(parsedMod.root.id)) ? true : false
                        resolve(parsedMod)
                    })
                })
            }))
        })

        return { modsData: await Promise.all(mods), modsConfig }
    })

    ipcMain.handle("api:setModEnabled", (_, mode, modID) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))
            const enabledMods = Array.isArray(modsConfig.mods.mod) ? modsConfig.mods.mod : [modsConfig.mods.mod]
            modsConfig.mods.mod = enabledMods
            if (!modsConfig.mods.mod.includes(modID)) {
                modsConfig.mods.mod.push(modID);
            }
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))

            return { success: true }
        } catch (e) {
            return { success: false, error: e.toString() }
        }
    })

    ipcMain.handle("api:setModDisabled", (_, mode, modID) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))
            const enabledMods = Array.isArray(modsConfig.mods.mod) ? modsConfig.mods.mod : [modsConfig.mods.mod]
            modsConfig.mods.mod = enabledMods
            modsConfig.mods.mod.splice(modsConfig.mods.mod.findIndex(i => i.split("_")[0] == modID), 1)
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))

            return { success: true }
        } catch (e) {
            return { success: false, error: e.toString() }
        }
    })

    ipcMain.handle("api:uploadMod", async (_, mode, mod) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const zip = new jszip()
        try {
            const zipFiles = await zip.loadAsync(mod)
            const fileName = parser.parse(await zipFiles.file("Header.xml").async("string")).root.id

            fs.writeFileSync(getModPath(mode, fileName), mod);
        } catch (e) {
            return { success: false, error: e.toString() }
        }

        return { success: true }
    })

    ipcMain.handle("api:uploadModLink", async (_, mode, link) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const zip = new jszip()

        try {
            const file = await (await fetch(link)).arrayBuffer();

            const zipFiles = await zip.loadAsync(file)
            const fileName = parser.parse(await zipFiles.file("Header.xml").async("string")).root.id

            fs.writeFileSync(getModPath(mode, fileName), file);
        } catch (e) {
            return { success: false, error: e.toString() }
        }

        return { success: true }
    })

    ipcMain.handle("api:deleteMod", (_, mode, modID) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            fs.rmSync(getModPath(mode, modID))

            const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))
            modsConfig.mods.mod.splice(modsConfig.mods.mod.findIndex(i => i.split("_")[0] == modID), 1)
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))
        } catch (e) {
            return { sucess: false, error: e.toString() }
        }

        return { success: true }
    })

    main()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length == 0) main()
    })
})

app.on("window-all-closed", () => {
    if (process.platform != "darwin") app.quit()
})