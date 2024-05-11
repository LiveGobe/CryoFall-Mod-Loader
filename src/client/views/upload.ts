import { getElementById } from "../../lib/get-element-by-id"
import { isInstanceOf } from "../../lib/is-instance-of"
import { ModListLoadEvent } from "../api/mod-list/load"
import { ModSaveFromFileDoneEvent, ModSaveFromFileEvent, ModSaveFromFileFailEvent } from "../api/mod/save-from-file"
import { ModSaveFromUrlDoneEvent, ModSaveFromUrlEvent, ModSaveFromUrlFailEvent } from "../api/mod/save-from-url"
import { getCurrentLaunchType } from "../app"
import { createNotification } from "../notification-list"

const uplaodModDialogOpenButton = getElementById(document, 'upload-mod-dialog-open-button', HTMLButtonElement)
uplaodModDialogOpenButton.addEventListener('click', () => {
    uploadModDialog.showModal()
})
const uploadModDialog = getElementById(document, 'upload-mod-dialog', HTMLDialogElement)
uploadModDialog.addEventListener('click', e => {
    const { target, currentTarget } = e
    if (target !== currentTarget) {
        return
    }
    const { top, left, bottom, right } = uploadModDialog.getBoundingClientRect()
    const { clientX, clientY } = e
    const insideVertical = top <= clientY && clientY <= bottom
    const insideHorizontal = left <= clientX && clientX <= right
    if (insideVertical && insideHorizontal) {
        return
    }
    uploadModDialog.close()
})

const uploadModFileInput = getElementById(document, 'upload-mod-file-input', HTMLInputElement)
const uploadModLinkForm = getElementById(document, 'upload-mod-link-form', HTMLFormElement)
const uploadModLinkInput = getElementById(document, 'upload-mod-link-input', HTMLInputElement)

// drag and drop
const dropOverlayControl = getElementById(document, 'drop-overlay-control', HTMLInputElement)


async function dispatchSaveFromFile(file: File) {
    return await ModSaveFromFileEvent.dispatch(getCurrentLaunchType(), new Int8Array(await file.arrayBuffer()))
}

function dispatchSaveFromFileList(files: FileList | null | false | undefined) {
    if (!files) {
        return []
    }
    return Array.from(files).filter(it => it.name.endsWith('.mpk')).map(dispatchSaveFromFile)
}


window.addEventListener('dragenter', e => {
    if (uploadModDialog.open) {
        return
    }
    if (e.dataTransfer?.types?.includes('Files')) {
        dropOverlayControl.checked = true
        e.preventDefault()
    }
})
window.addEventListener('dragover', e => {
    if (uploadModDialog.open) {
        return
    }
    if (e.dataTransfer?.types?.includes('Files')) {
        dropOverlayControl.checked = true
        e.preventDefault()
    }
})
window.addEventListener('dragleave', e => {
    if (uploadModDialog.open) {
        return
    }
    if (!e.relatedTarget) {
        dropOverlayControl.checked = false
        e.preventDefault()
    }
})
window.addEventListener('drop', async e => {
    if (uploadModDialog.open) {
        return
    }
    dropOverlayControl.checked = false
    e.preventDefault();
    dispatchSaveFromFileList(e.dataTransfer?.files)
})
const isInstanceOfClipboardEvent = isInstanceOf(ClipboardEvent)
window.addEventListener('paste', async e => {
    if (!isInstanceOfClipboardEvent(e)) {
        return
    }
    if (uploadModDialog.open) {
        return
    }

    const text = e.clipboardData?.getData('text/plain') ?? ''
    if (/^(https?:)?\/\//.test(text)) {
        ModSaveFromUrlEvent.dispatch(uploadModLinkInput.value)
    }
    [...e.clipboardData?.files || []].filter(it => it.name.endsWith('.mpk')).forEach(dispatchSaveFromFile)
})

uploadModLinkForm.addEventListener('submit', async e => {
    e.preventDefault()
    ModSaveFromUrlEvent.dispatch(uploadModLinkInput.value)
    uploadModLinkInput.value = ''
    uploadModDialog.close()
})

uploadModLinkInput.addEventListener('keydown', e => {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || e.key !== 'Escape') {
        return
    }
    e.preventDefault()
    uploadModLinkInput.value = ''
})

uploadModFileInput.addEventListener('change', async () => {
    dispatchSaveFromFileList(uploadModFileInput.files)
    // @ts-expect-error
    uploadModFileInput.value = null
    uploadModDialog.close()
})

export function initUploadView() {
    enum SaveType {
        file = 'file',
        url = 'url',
    }
    type SaveFile = {
        readonly integrityId: string
        readonly type: SaveType.file
        readonly int8Array: Int8Array
    }
    type SaveUrl = {
        readonly integrityId: string
        readonly type: SaveType.url
        readonly url: string
    }
    type Save =
        | SaveFile
        | SaveUrl
    const saves = new Map<string, Save>()

    ModSaveFromFileEvent.on(e => {
        saves.set(e.integrityId, {
            type: SaveType.file,
            int8Array: e.int8Array,
            integrityId: e.integrityId,
        })
    })

    ModSaveFromFileDoneEvent.on((e) => {
        saves.delete(e.integrityId)
        ModListLoadEvent.dispatch()
    })

    ModSaveFromFileFailEvent.on((e) => {
        saves.delete(e.integrityId)
        createNotification('error', {
            title: 'Save failed',
            description: e.error
        })
    })

    ModSaveFromUrlEvent.on(e => {
        saves.set(e.integrityId, {
            type: SaveType.url,
            url: e.url,
            integrityId: e.integrityId,
        })
    })

    ModSaveFromUrlDoneEvent.on((e) => {
        saves.delete(e.integrityId)
        ModListLoadEvent.dispatch()
    })
    ModSaveFromUrlFailEvent.on((e) => {
        saves.delete(e.integrityId)
        createNotification('error', {
            title: 'Save failed',
            description: e.error
        })
    })

}