const { app, BrowserWindow, ipcMain } = require("electron")
const { XMLParser, XMLBuilder } = require("fast-xml-parser")
const jszip = require("jszip")
const path = require("node:path")
const fs = require("node:fs")
const { isObject } = require("./ui/lib/is-object/index.js")
const { isString } = require("./ui/lib/is-string/index.js")

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

function fixModsConfig(modsConfig) {
    if (!isObject(modsConfig) || !isObject(modsConfig['?xml'])) {
        modsConfig = {
            '?xml': {
                '@_version': '1.0',
                '@_encoding': 'utf-8',
                '@_standalone': 'yes',
            },
        }
    }
    if (!isObject(modsConfig.mods)) {
        modsConfig.mods = {}
    }
    const modList = Array.isArray(modsConfig.mods.mod) ? modsConfig.mods.mod : [modsConfig.mods.mod]
    modsConfig.mods.mod = modList.filter(isString)
    return modsConfig
}

function readModsConfigSync(filepath) {
    const parser = new XMLParser({ ignoreAttributes: false })
    const res = parser.parse(fs.readFileSync(filepath))
    return fixModsConfig(res)
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

        const modsConfig = readModsConfigSync(getModsConfigPath(mode))

        let mods = [];
        fs.readdirSync(path.join(config.folderpaths[mode], "Mods")).forEach(mod => {
            if (!mod.endsWith(".mpk")) return
            mods.push(new Promise((resolve, reject) => {
                const buffer = fs.readFileSync(path.join(config.folderpaths[mode], "Mods", mod))
                const zip = new jszip()
                zip.loadAsync(buffer).then(zipFiles => {
                    zipFiles.file("Header.xml").async("string").then(readMod => {
                        const parsedMod = parser.parse(readMod)
                        parsedMod.root.fileName = path.join(config.folderpaths[mode], "Mods", mod)
                        parsedMod.root.enabled = modsConfig.mods.mod.find(i => i.startsWith(parsedMod.root.id)) ? true : false
                        resolve(parsedMod)
                    })
                })
            }))
        })

        return { modsData: await Promise.all(mods), modsConfig }
    })

    ipcMain.handle("api:setModEnabled", (_, mode, modID) => {
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            const modsConfig = readModsConfigSync(getModsConfigPath(mode))
            if (!modsConfig.mods.mod.includes(modID)) {
                modsConfig.mods.mod.push(modID);
            }
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))

            return { success: true }
        } catch (e) {
            return { success: false, errmsg: e.toString() }
        }
    })

    ipcMain.handle("api:setModDisabled", (_, mode, modID) => {
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            const modsConfig = readModsConfigSync(getModsConfigPath(mode))
            modsConfig.mods.mod.splice(modsConfig.mods.mod.findIndex(i => i.split("_")[0] == modID), 1)
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))

            return { success: true }
        } catch (e) {
            return { success: false, errmsg: e.toString() }
        }
    })

    ipcMain.handle("api:uploadMod", async (_, mode, mod) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const zip = new jszip()
        try {
            const zipFiles = await zip.loadAsync(Buffer.from(mod))
            const fileName = parser.parse(await zipFiles.file("Header.xml").async("string")).root.id
            fs.writeFileSync(getModPath(mode, fileName), mod);
        } catch (e) {
            return { success: false, errmsg: e.toString() }
        }

        return { success: true }
    })

    ipcMain.handle("api:uploadModLink", async (_, mode, link) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const zip = new jszip()

        try {
            const buffer = Buffer.from(new Int8Array(await (await fetch(link)).arrayBuffer()));

            const zipFiles = await zip.loadAsync(buffer)
            const fileName = parser.parse(await zipFiles.file("Header.xml").async("string")).root.id

            fs.writeFileSync(getModPath(mode, fileName), buffer);
        } catch (e) {
            return { success: false, errmsg: e.toString() }
        }

        return { success: true }
    })

    ipcMain.handle("api:deleteMod", (_, mode, modID) => {
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            fs.rmSync(getModPath(mode, modID))

            const modsConfig = readModsConfigSync(getModsConfigPath(mode))
            modsConfig.mods.mod.splice(modsConfig.mods.mod.findIndex(i => i.split("_")[0] == modID), 1)
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))
        } catch (e) {
            return { sucess: false, errmsg: e.toString() }
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