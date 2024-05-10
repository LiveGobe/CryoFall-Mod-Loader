declare global {
    interface Window {
        addEventListener(eventName: 'cfml.mod-list.load', handler: (this: Window, ev: ModListLoadEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.load', handler: (this: Window, ev: ModListLoadEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.load.done', handler: (this: Window, ev: ModListLoadDoneEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.load.done', handler: (this: Window, ev: ModListLoadDoneEvent) => any): void
        addEventListener(eventName: 'cfml.mod-list.load.fail', handler: (this: Window, ev: ModListLoadFailEvent) => any): void
        removeEventListener(eventName: 'cfml.mod-list.load.fail', handler: (this: Window, ev: ModListLoadFailEvent) => any): void
    }
}


export class ModListLoadEvent extends Event {
    static integrityId: string | undefined
    static async dispatch(launchType: CryoFallModLoader.LaunchType) {
        ModListLoadEvent.integrityId = crypto.randomUUID()
        const actionEvent = new ModListLoadEvent(ModListLoadEvent.integrityId, launchType)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.ModList.load(launchType)
        if (actionEvent.integrityId !== ModListLoadEvent.integrityId) {
            return
        }
        if (res.success) {
            window.dispatchEvent(new ModListLoadDoneEvent(ModListLoadEvent.integrityId, launchType, res.payload))
        } else {
            window.dispatchEvent(new ModListLoadFailEvent(ModListLoadEvent.integrityId, launchType, res.error))
        }
    }
    static on(hander: (this: Window, ev: ModListLoadEvent) => any) {
        window.addEventListener('cfml.mod-list.load', hander)
    }
    static off(hander: (this: Window, ev: ModListLoadEvent) => any) {
        window.removeEventListener('cfml.mod-list.load', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType
    ) {
        super('cfml.mod-list.load')
    }
}

export class ModListLoadDoneEvent extends Event {
    static on(hander: (this: Window, ev: ModListLoadDoneEvent) => any) {
        window.addEventListener('cfml.mod-list.load.done', hander)
    }
    static off(hander: (this: Window, ev: ModListLoadDoneEvent) => any) {
        window.removeEventListener('cfml.mod-list.load.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly payload: CryoFallModLoader.Mod.ModData[]
    ) {
        super('cfml.mod-list.load.done')
    }
}

export class ModListLoadFailEvent extends Event {
    static on(hander: (this: Window, ev: ModListLoadFailEvent) => any) {
        window.addEventListener('cfml.mod-list.load.fail', hander)
    }
    static off(hander: (this: Window, ev: ModListLoadFailEvent) => any) {
        window.removeEventListener('cfml.mod-list.load.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly error: string
    ) {
        super('cfml.mod-list.load.fail')
    }
}
