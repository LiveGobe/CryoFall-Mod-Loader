!async function() {
    let cfg = await config.load();
    const $modeSelect = document.getElementById("mode-select");
    const $folderPath = document.getElementById("folder-path");
    const $clientModsList = document.getElementById("client-mods-list");

    $folderPath.value = cfg.folderpaths.client;

    $modeSelect.addEventListener("change", async e => {
        switch ($modeSelect.value) {
            case "client":
            $folderPath.setAttribute("placeholder", "Folder path to CryoFall directory with modsConfig.xml");
            $folderPath.value = cfg.folderpaths.client;
            $clientModsList.innerHTML = "";
            let modList = await config.getXML("client");
            modList.mods.mod.slice(1).forEach(mod => {
                let elem = document.createElement("div");
                elem.classList.add("mod-entry");
                elem.innerText = "MOD";
                $clientModsList.append(elem);
            });
            break
            case "editor":
            $folderPath.setAttribute("placeholder", "Folder path to CryoFall Editor directory with modsConfig.xml");
            $folderPath.value = cfg.folderpaths.editor;
            break
            case "server":
            $folderPath.setAttribute("placeholder", "Folder path to CryoFall Server Data directory with modsConfig.xml");
            $folderPath.value = cfg.folderpaths.server;
            break
        }
    });
}();