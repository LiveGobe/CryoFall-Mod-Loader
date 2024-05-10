declare global {
    interface Window {
        addEventListener(eventName: 'cfml.mod-list.delete', handler: (this: Window, ev: ModListDeleteEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.delete', handler: (this: Window, ev: ModListDeleteEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.delete.done', handler: (this: Window, ev: ModListDeleteDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.delete.done', handler: (this: Window, ev: ModListDeleteDoneEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.delete.fail', handler: (this: Window, ev: ModListDeleteFailEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.delete.fail', handler: (this: Window, ev: ModListDeleteFailEvent) => any): void
    }
}


export class ModListDeleteEvent extends Event {
    static integrityId: string | undefined
    static async dispatch(launchType: CryoFallModLoader.LaunchType, modId: string) {
        ModListDeleteEvent.integrityId = crypto.randomUUID()
        const actionEvent = new ModListDeleteEvent(ModListDeleteEvent.integrityId, launchType, modId)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.ModList.delete(launchType, modId)
        if (actionEvent.integrityId !== ModListDeleteEvent.integrityId) {
            return
        }
        if (res.success) {
            window.dispatchEvent(new ModListDeleteDoneEvent(ModListDeleteEvent.integrityId, launchType, modId))
        } else {
            window.dispatchEvent(new ModListDeleteFailEvent(ModListDeleteEvent.integrityId, launchType, modId, res.error))
        }
    }
    static on(hander: (this: Window, ev: ModListDeleteEvent) => any) {
        window.addEventListener('cfml.mod-list.delete', hander)
    }
    static off(hander: (this: Window, ev: ModListDeleteEvent) => any) {
        window.removeEventListener('cfml.mod-list.delete', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
    ) {
        super('cfml.mod-list.delete')
    }
}

export class ModListDeleteDoneEvent extends Event {
    static on(hander: (this: Window, ev: ModListDeleteDoneEvent) => any) {
        window.addEventListener('cfml.mod-list.delete.done', hander)
    }
    static off(hander: (this: Window, ev: ModListDeleteDoneEvent) => any) {
        window.removeEventListener('cfml.mod-list.delete.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
    ) {
        super('cfml.mod-list.delete.done')
    }
}

export class ModListDeleteFailEvent extends Event {
    static on(hander: (this: Window, ev: ModListDeleteFailEvent) => any) {
        window.addEventListener('cfml.mod-list.delete.fail', hander)
    }
    static off(hander: (this: Window, ev: ModListDeleteFailEvent) => any) {
        window.removeEventListener('cfml.mod-list.delete.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly modId: string,
        public readonly error: string
    ) {
        super('cfml.mod-list.delete.fail')
    }
}