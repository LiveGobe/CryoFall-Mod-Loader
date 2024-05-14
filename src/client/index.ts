import { getElementById } from "../lib/get-element-by-id"
import { isInstanceOf } from "../lib/is-instance-of"
import { setCurrentView, setLaunchType, ViewType } from "./app"
import { initConfigView } from "./views/config"
import { initModView } from "./views/mod"
import { initModListView } from "./views/mod-list"
import { initUploadView } from "./views/upload"

const isInstanceOfHTMLInputElement = isInstanceOf(HTMLInputElement)

document.body.addEventListener('click', e => {
    const target = e.target as Element
    if (target.closest('.select') || target.matches('.select')) {
        return
    }
    document.querySelectorAll('.select .select-switch').forEach(it => {
        if (isInstanceOfHTMLInputElement(it)) {
            it.checked = false
        }
    })
}, { capture: true })

// load data
!async function () {
    await Promise.all([
        initUploadView(),
        initConfigView(),
        initModListView(),
        initModView(),
    ])
    setCurrentView(ViewType.modList)
    setLaunchType(CryoFallModLoader.LaunchType.client)
}()