import { getCurrentLaunchType } from "../../app"

declare global {
    interface Window {
        addEventListener(eventName: 'cfml.mod.save-from-url', handler: (this: Window, ev: ModSaveFromUrlEvent) => any, options?: boolean | AddEventListenerOptions): void
        removeEventListener(eventName: 'cfml.mod.save-from-url', handler: (this: Window, ev: ModSaveFromUrlEvent) => any, options?: boolean | EventListenerOptions): void
        addEventListener(eventName: 'cfml.mod.save-from-url.done', handler: (this: Window, ev: ModSaveFromUrlDoneEvent) => any, options?: boolean | AddEventListenerOptions): void
        removeEventListener(eventName: 'cfml.mod.save-from-url.done', handler: (this: Window, ev: ModSaveFromUrlDoneEvent) => any, options?: boolean | EventListenerOptions): void
        addEventListener(eventName: 'cfml.mod.save-from-url.fail', handler: (this: Window, ev: ModSaveFromUrlFailEvent) => any, options?: boolean | AddEventListenerOptions): void
        removeEventListener(eventName: 'cfml.mod.save-from-url.fail', handler: (this: Window, ev: ModSaveFromUrlFailEvent) => any, options?: boolean | EventListenerOptions): void
        addEventListener(eventName: 'cfml.mod.save-from-url.end', handler: (this: Window, ev: ModSaveFromUrlEndEvent) => any, options?: boolean | AddEventListenerOptions): void
        removeEventListener(eventName: 'cfml.mod.save-from-url.end', handler: (this: Window, ev: ModSaveFromUrlEndEvent) => any, options?: boolean | EventListenerOptions): void
    }
}

export class ModSaveFromUrlEvent extends Event {
    static async dispatch(url: string) {
        const integrityId = crypto.randomUUID()
        const launchType = getCurrentLaunchType()
        const actionEvent = new ModSaveFromUrlEvent(integrityId, launchType, url)
        if (!window.dispatchEvent(actionEvent)) {
            return
        }
        const res = await CryoFallModLoader.Mod.saveFromUrl(launchType, url)
        if (res.success) {
            window.dispatchEvent(new ModSaveFromUrlDoneEvent(integrityId, launchType, url))
        } else {
            window.dispatchEvent(new ModSaveFromUrlFailEvent(integrityId, launchType, url, res.error))
        }
        window.dispatchEvent(new ModSaveFromUrlEndEvent(integrityId, launchType, url))
    }
    static on(hander: (this: Window, ev: ModSaveFromUrlEvent) => any, options?: boolean | AddEventListenerOptions) {
        window.addEventListener('cfml.mod.save-from-url', hander, options)
    }
    static off(hander: (this: Window, ev: ModSaveFromUrlEvent) => any, options?: boolean | EventListenerOptions) {
        window.removeEventListener('cfml.mod.save-from-url', hander, options)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly url: string,
    ) {
        super('cfml.mod.save-from-url', { bubbles: true, cancelable: true, composed: true })
    }
}

export class ModSaveFromUrlDoneEvent extends Event {
    static on(hander: (this: Window, ev: ModSaveFromUrlDoneEvent) => any) {
        window.addEventListener('cfml.mod.save-from-url.done', hander)
    }
    static off(hander: (this: Window, ev: ModSaveFromUrlDoneEvent) => any) {
        window.removeEventListener('cfml.mod.save-from-url.done', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly url: string,
    ) {
        super('cfml.mod.save-from-url.done')
    }
}

export class ModSaveFromUrlFailEvent extends Event {
    static on(hander: (this: Window, ev: ModSaveFromUrlFailEvent) => any) {
        window.addEventListener('cfml.mod.save-from-url.fail', hander)
    }
    static off(hander: (this: Window, ev: ModSaveFromUrlFailEvent) => any) {
        window.removeEventListener('cfml.mod.save-from-url.fail', hander)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly url: string,
        public readonly error: string,
    ) {
        super('cfml.mod.save-from-url.fail')
    }
}

export class ModSaveFromUrlEndEvent extends Event {
    static on(hander: (this: Window, ev: ModSaveFromUrlEndEvent) => any, options?: boolean | AddEventListenerOptions) {
        window.addEventListener('cfml.mod.save-from-url.end', hander, options)
    }
    static off(hander: (this: Window, ev: ModSaveFromUrlEndEvent) => any, options?: boolean | EventListenerOptions) {
        window.removeEventListener('cfml.mod.save-from-url.end', hander, options)
    }
    constructor(
        public readonly integrityId: string,
        public readonly launchType: CryoFallModLoader.LaunchType,
        public readonly url: string,
    ) {
        super('cfml.mod.save-from-url.end')
    }
}