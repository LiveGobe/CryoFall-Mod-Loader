const { app, BrowserWindow, ipcMain } = require("electron")
const { XMLParser, XMLBuilder } = require("fast-xml-parser")
const jszip = require("jszip")
const path = require("node:path")
const fs = require("node:fs")

let config = { 
    folderpaths: {
        client: path.join(process.env.HOME, "Documents\\AtomicTorchStudio\\CryoFall"),
        editor: path.join(process.env.HOME, "Documents\\AtomicTorchStudio\\CryoFall Editor"),
        server: ""
    }
}

if (fs.existsSync("./config.json")) config = require("./config.json")
else {
    if (!fs.existsSync(config.folderpaths.client)) {
        if (!fs.existsSync(path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall"))) config.folderpaths.client = ""
        else config.folderpaths.client = path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall")
    }

    if (!fs.existsSync(config.folderpaths.editor)) {
        if (!fs.existsSync(path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall Editor"))) config.folderpaths.editor = ""
        else config.folderpaths.editor = path.join(process.env.OneDrive, "Documents\\AtomicTorchStudio\\CryoFall Editor")
    }
}

if (require('electron-squirrel-startup')) app.quit()

function getModsConfigPath(mode) {
    return path.join(config.folderpaths[mode], "ModsConfig.xml")
}

function getModPath(mode, modID) {
    return path.join(config.folderpaths[mode], "Mods", modID + ".mpk")
}

function isModArray(mod) { return (typeof mod == "Object") }

const main = () => {
    const win = new BrowserWindow({ width: 800, height: 500, webPreferences: { preload: path.join(__dirname, "preload.js") }, autoHideMenuBar: true})
    win.loadFile("index.html")
}

app.whenReady().then(() => {
    ipcMain.handle("config:load", () => config)

    ipcMain.handle("config:save", (_, conf) => {
        try {
            fs.writeFileSync(path.join(__dirname, "config.json"), conf);
        } catch (e) {
            return { success: false, error: e.toString() }
        }

        return { success: true }
    })

    ipcMain.handle("config:getModsData", async (_, mode) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const zip = new jszip()

        const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))

        let mods = [];
        fs.readdirSync(path.join(config.folderpaths[mode], "Mods")).forEach(mod => {
            if (!mod.endsWith(".mpk")) return
            mods.push(new Promise((resolve, reject) => {
                const buffer = fs.readFileSync(path.join(config.folderpaths[mode], "Mods", mod))
                zip.loadAsync(buffer).then(zipFiles => {
                    zipFiles.file("Header.xml").async("string").then(readMod => {
                        const parsedMod = parser.parse(readMod)
                        if (!isModArray(modsConfig.mods.mod)) return resolve(parsedMod)
                        parsedMod.root.enabled = modsConfig.mods.mod.find(i => i == (parsedMod.root.id + "_" + parsedMod.root.version)) ? true : false
                        resolve(parsedMod)
                    })
                })
            }))
        })

        return { modsData: await Promise.all(mods), modsConfig }
    })

    ipcMain.handle("config:setModEnabled", (_, mode, modID) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))
            modsConfig.mods.mod.push(modID);
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))

            return { success: true }
        } catch (e) {
            return { success: false, error: e.toString() }
        }
    })

    ipcMain.handle("config:setModDisabled", (_, mode, modID) => {
        const parser = new XMLParser({ ignoreAttributes: false })
        const builder = new XMLBuilder({ ignoreAttributes: false, format: true })

        try {
            const modsConfig = parser.parse(fs.readFileSync(getModsConfigPath(mode)))
            modsConfig.mods.mod.splice(modsConfig.mods.mod.findIndex(i => i.split("_")[0] == modID), 1)
            fs.writeFileSync(getModsConfigPath(mode), builder.build(modsConfig))

            return { success: true }
        } catch (e) {
            return { success: false, error: e.toString() }
        }
    })

    ipcMain.handle("config:uploadMod", async (_, mode, mod) => {
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

    ipcMain.handle("config:uploadModLink", async (_, mode, link) => {
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

    ipcMain.handle("config:deleteMod", (_, mode, modID) => {
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