// @ts-check
/// <reference path="../global.d.ts" />

import { isInstanceOf, isOneOf } from "../lib/guard/index.js"
import { getElementById, getElementByIdOfType } from "../lib/html/index.js"
import { Watchable } from "../lib/watchable/index.js"
import { ModEntryTemplate } from "./components/mod-entry/index.js"
import { modeChangedSignal, setModEnabled } from "./signals.js"

const cryofallLaunchLink = 'steam://rungameid/829590'
const cryofallEditorLaunchLink = 'steam://rungameid/1061720'

function createModeSelectStream() {
    return Watchable.fromInput(getElementByIdOfType('mode-select', isInstanceOf(HTMLSelectElement)), isModeType)
}

const isModeType = isOneOf(['client', 'server', 'editor'])

!async function () {
    let cfg = await config.load()

    const $lauchAnchor = getElementByIdOfType('launch-button', isInstanceOf(HTMLAnchorElement))
    $lauchAnchor.addEventListener('click', e => {
        if (!$lauchAnchor.href || $lauchAnchor.classList.contains('disabled')) {
            e.preventDefault()
        }
    })

    const $modeSelect = createModeSelectStream()
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

    const $modList = getElementById('mod-list')
    const modEntryTemplate = new ModEntryTemplate('mod-entry-tpl')

    async function updateModList(mode) {
        console.log('updateModList', mode)
        $modList.childNodes.forEach(node => {
            node.remove()
        })
        const { modsData } = await config.getModsData(mode)
        modsData.forEach(modData => {
            const modEntryComponent = modEntryTemplate.create(modData.root)
            modEntryComponent.mount($modList)
        })
    }


    modeChangedSignal.listen(updateLaunchHref)
    modeChangedSignal.listen(updateModList)
    setModEnabled.listen(async ({ modID, enabled }) => {
        const res = enabled
            ? await config.setModEnabled($modeSelect.value, modID)
            : await config.setModDisabled($modeSelect.value, modID)
        if (res.success) {
            updateModList($modeSelect.value)
        } else {
            console.error(res.errmsg)
        }
    })

    modeChangedSignal($modeSelect.value)
    $modeSelect.update.listen(modeChangedSignal)
}()