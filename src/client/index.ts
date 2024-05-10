import { isInstanceOf } from "../lib/is-instance-of"
import { ModListLoadEvent } from "./api/mod-list/load"
import { getCurrentLaunchType, setCurrentView, setLaunchType, ViewType } from "./app"
import { loadConfig } from "./config"
import * as el from './elements'
import { initModView } from "./mod"
import { initModListView } from "./mod-list"

async function uploadMod(file: File) {
    const data = await file.arrayBuffer()
    return await CryoFallModLoader.Mod.saveFromFile(getCurrentLaunchType(), new Int8Array(data))
}

function uploadFileList(files: FileList | null) {
    if (!files) {
        return []
    }
    return Array.from(files).filter(it => it.name.endsWith('.mpk')).map(async data => CryoFallModLoader.Mod.saveFromFile(getCurrentLaunchType(), new Int8Array(await data.arrayBuffer())))
}

window.addEventListener('dragenter', e => {
    if (el.uploadModDialog.open) {
        return
    }
    if (e.dataTransfer?.types?.includes('Files')) {
        el.dropOverlayControl.checked = true
        e.preventDefault()
    }
})
window.addEventListener('dragover', e => {
    if (el.uploadModDialog.open) {
        return
    }
    if (e.dataTransfer?.types?.includes('Files')) {
        el.dropOverlayControl.checked = true
        e.preventDefault()
    }
})
window.addEventListener('dragleave', e => {
    if (el.uploadModDialog.open) {
        return
    }
    if (!e.relatedTarget) {
        el.dropOverlayControl.checked = false
        e.preventDefault()
    }
})
window.addEventListener('drop', async e => {
    if (el.uploadModDialog.open) {
        return
    }
    el.dropOverlayControl.checked = false
    e.preventDefault()
    const tasks = [...e.dataTransfer?.files || []].filter(it => it.name.endsWith('.mpk')).map(uploadMod)
    const resList = await Promise.all(tasks)
    resList.forEach(res => {
        if (!res.success) {
            console.error(res.error)
        }
    })
    ModListLoadEvent.dispatch(getCurrentLaunchType())
})
const isInstanceOfClipboardEvent = isInstanceOf(ClipboardEvent)
window.addEventListener('paste', async e => {
    if (!isInstanceOfClipboardEvent(e)) {
        return
    }
    if (el.uploadModDialog.open) {
        return
    }

    const text = e.clipboardData?.getData('text/plain') ?? ''
    const uploadTasks = []
    if (/^(https?:)?\/\//.test(text)) {
        uploadTasks.push(CryoFallModLoader.Mod.saveFromUrl(getCurrentLaunchType(), text))
    }
    [...e.clipboardData?.files || []].filter(it => it.name.endsWith('.mpk')).forEach(it => {
        uploadTasks.push(uploadMod(it))
    })
    const resList = await Promise.all(uploadTasks)
    resList.forEach(res => {
        if (!res.success) {
            console.error(res.error)
        }
    })
    ModListLoadEvent.dispatch(getCurrentLaunchType())
})

el.uploadModLinkForm.addEventListener('submit', async e => {
    e.preventDefault()
    const res = await CryoFallModLoader.Mod.saveFromUrl(getCurrentLaunchType(), el.uploadModLinkInput.value)
    if (!res.success) {
        console.error(res.error)
        return
    }
    ModListLoadEvent.dispatch(getCurrentLaunchType())
    el.uploadModLinkInput.value = ''
    el.uploadModDialog.close()
})

el.uploadModLinkInput.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || e.key !== 'Escape') {
        return
    }
    e.preventDefault()
    el.uploadModLinkInput.value = ''
})

el.uploadModFileInput.addEventListener('change', async () => {
    const uploadTaskList = uploadFileList(el.uploadModFileInput.files)
    const resList = await Promise.all(uploadTaskList)
    resList.forEach(res => {
        if (!res.success) {
            console.error(res.error)
        }
    })
    ModListLoadEvent.dispatch(getCurrentLaunchType())
    // @ts-expect-error
    el.uploadModFileInput.value = null
    el.uploadModDialog.close()
})

// load data
!async function () {
    await Promise.all([
        loadConfig(),
        initModListView(),
        initModView(),
    ])
    setCurrentView(ViewType.modList)
    setLaunchType(CryoFallModLoader.LaunchType.client)
}()