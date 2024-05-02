const { app, BrowserWindow, ipcMain } = require("electron");
const { XMLParser, XMLBuilder } = require("fast-xml-parser");
const jszip = require("jszip");
const path = require("node:path");
const fs = require("node:fs");

let config = {};
if (fs.existsSync("./config.json")) config = require("./config.json");

if (require('electron-squirrel-startup')) app.quit();

const main = () => {
    const win = new BrowserWindow({ width: 800, height: 500, webPreferences: { preload: path.join(__dirname, "preload.js") }, autoHideMenuBar: true});
    win.loadFile("index.html");
}

app.whenReady().then(() => {
    ipcMain.handle("config:load", () => config);
    ipcMain.handle("config:getXML", (_, mode) => {
        const parser = new XMLParser();
        switch (mode) {
            case "client":
            return parser.parse(fs.readFileSync(path.join(config.folderpaths.client, "ModsConfig.xml")));

            case "editor":
            return parser.parse(fs.readFileSync(path.join(config.folderpaths.editor, "ModsConfig.xml")));

            case "server":
            return parser.parse(fs.readFileSync(path.join(config.folderpaths.server, "ModsConfig.xml")));

            default:
            return {};
        }
    });
    ipcMain.handle("mods:getData", async (_, mode, mod) => {
        const parser = new XMLParser();
        const zip = new jszip();
        switch (mode) {
            case "client":
            const buffer = fs.readFileSync(path.join(config.folderpaths.client, "Mods", mod));
            const zipFiles = await zip.loadAsync(buffer);
            return parser.parse(await zipFiles.file("Header.xml").async("string"));
            case "editor":


            case "server":


            default:
            return {};
        }
    });
    main();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length == 0) main();
    })
});

app.on("window-all-closed", () => {
    if (process.platform != "darwin") app.quit();
})