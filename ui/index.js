// @ts-check
/// <reference path="../global.d.ts" />

import { isInstanceOf } from "../lib/guard/index.js"
import { getElementByIdOfType } from "../lib/html/index.js"
import { createSignal } from "../lib/signal/index.js"
import { Watchable } from "../lib/watchable/index.js"

const cryofallLaunchLink = 'steam://rungameid/829590'
console.log('cryofallLaunchLink', cryofallLaunchLink)
const cryofallEditorLaunchLink = 'steam://rungameid/1061720'
console.log('cryofallEditorLaunchLink', cryofallEditorLaunchLink)

function createModeSelectStream() {
    return Watchable.fromInput(getElementByIdOfType('mode-select', isInstanceOf(HTMLSelectElement)))
}

!async function () {
    let cfg = await config.load()
    let data = await config.getModsData("client")

    const $lauchAnchor = getElementByIdOfType('launch-button', isInstanceOf(HTMLAnchorElement))
    $lauchAnchor.addEventListener('click', e => {
        if (!$lauchAnchor.href || $lauchAnchor.classList.contains('disabled')) {
            e.preventDefault()
        }
    })

    const $modeSelect = createModeSelectStream()
    const modeChangedSignal = createSignal()

    $modeSelect.update.listen(modeChangedSignal)
    function updateLaunchHref(mode) {
        $lauchAnchor.classList.remove('disabled')
        switch (mode) {
            case 'client':
                $lauchAnchor.href = cryofallLaunchLink
                break
            case 'server':
                $lauchAnchor.href = ''
                $lauchAnchor.classList.add('disabled')
                break
            case 'editor':
                $lauchAnchor.href = cryofallEditorLaunchLink
                break
        }
    }


    modeChangedSignal.listen(updateLaunchHref)
    const $folderPath = document.getElementById("folder-path")
    const $clientModsList = document.getElementById("client-mods-list")

    // $folderPath.value = cfg.folderpaths.client

    // $modeSelect.addEventListener("change", async e => {
    //     switch ($modeSelect.value) {
    //         case "client":
    //             $folderPath.setAttribute("placeholder", "Folder path to CryoFall directory with modsConfig.xml")
    //             $folderPath.value = cfg.folderpaths.client
    //             $clientModsList.innerHTML = ""
    //             let modList = await config.getXML("client")
    //             modList.mods.mod.slice(1).forEach(mod => {
    //                 let elem = document.createElement("div")
    //                 elem.classList.add("mod-entry")
    //                 elem.innerText = "MOD"
    //                 $clientModsList.append(elem)
    //             })
    //             break
    //         case "editor":
    //             $folderPath.setAttribute("placeholder", "Folder path to CryoFall Editor directory with modsConfig.xml")
    //             $folderPath.value = cfg.folderpaths.editor
    //             break
    //         case "server":
    //             $folderPath.setAttribute("placeholder", "Folder path to CryoFall Server Data directory with modsConfig.xml")
    //             $folderPath.value = cfg.folderpaths.server
    //             break
    //     }
    // })
}()