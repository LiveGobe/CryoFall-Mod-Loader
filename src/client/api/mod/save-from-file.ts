declare global {
    interface Window {
        addEventListener(eventName: 'cfml.mod.save-from-file', handler: (this: Window, ev: ModSaveFromFileEvent) => any): void
        removeEventListener(eventName: 'cfml.mod.save-from-file', handler: (this: Window, ev: ModSaveFromFileEvent) => any): void
        addEventListener(eventName: 'cfml.mod.save-from-file.done', handler: (this: Window, ev: ModSaveFromFileDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.mod.save-from-file.done', handler: (this: Window, ev: ModSaveFromFileDoneEvent) => any): void
        addEventListener(eventName: 'cfml.mod.save-from-file.fail', handler: (this: Window, ev: ModSaveFromFileFailEvent) => any): void
        removeEventListener(eventName: 'cfml.mod.save-from-file.fail', handler: (this: Window, ev: ModSaveFromFileFailEvent) => any): void
    }
}

export class ModSaveFromFileEvent extends Event {
    static async dispatch(launchType: CryoFallModLoader.LaunchType, int8Array: Int8Array) {
        const integrityId = crypto.randomUUID()
        const actionEvent = new ModSaveFromFileEvent(integrityId, launchType, int8Array)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.Mod.saveFromFile(launchType, int8Array)
        if (res.success) {
            window.dispatchEvent(new ModSaveFromFileDoneEvent(integrityId, launchType, int8Array))
        } else {
            window.dispatchEvent(new ModSaveFromFileFailEvent(integrityId, launchType, int8Array, res.error))
        }
    }
    static on(hander: (this: Window, ev: ModSaveFromFileEvent) => any) {
        window.addEventListener('cfml.mod.save-from-file', hander)
    }
    static off(hander: (this: Window, ev: ModSaveFromFileEvent) => any) {
        window.removeEventListener('cfml.mod.save-from-file', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly int8Array: Int8Array,
    ) {
        super('cfml.mod.save-from-file')
    }
}

export class ModSaveFromFileDoneEvent extends Event {
    static on(hander: (this: Window, ev: ModSaveFromFileDoneEvent) => any) {
        window.addEventListener('cfml.mod.save-from-file.done', hander)
    }
    static off(hander: (this: Window, ev: ModSaveFromFileDoneEvent) => any) {
        window.removeEventListener('cfml.mod.save-from-file.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly int8Array: Int8Array,
    ) {
        super('cfml.mod.save-from-file.done')
    }
}

export class ModSaveFromFileFailEvent extends Event {
    static on(hander: (this: Window, ev: ModSaveFromFileFailEvent) => any) {
        window.addEventListener('cfml.mod.save-from-file.fail', hander)
    }
    static off(hander: (this: Window, ev: ModSaveFromFileFailEvent) => any) {
        window.removeEventListener('cfml.mod.save-from-file.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly int8Array: Int8Array,
        public readonly error: string
    ) {
        super('cfml.mod.save-from-file.fail')
    }
}