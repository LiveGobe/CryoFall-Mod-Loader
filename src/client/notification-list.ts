import { cloneElement } from "../lib/clone-element"
import { getElementById } from "../lib/get-element-by-id"
import { querySelector } from "../lib/query-selector"

// notification
const notificationList = getElementById(document, 'notification-list')
const notificationEntryTemplate = getElementById(document, 'notification-entry-template', HTMLTemplateElement)

export type NotificationIntent =
    | 'message'
    | 'error'

export type NotificationData = {
    readonly title: string
    readonly description: string
    readonly retry?: () => void
}

function getNotificationElements(root: Element) {
    return {
        title: querySelector(root, '.title'),
        description: querySelector(root, '.description'),
        actions: {
            retry: querySelector(root, '.retry'),
            dismiss: querySelector(root, '.dismiss'),
        }
    }
}

type NotificationPrivates = {
    data: {
        retry: (() => void) | undefined
    },
    actions: {
        dismiss: (() => void)
        retry: (() => void)
    }
}

const vtable = new WeakMap<Element, NotificationPrivates>()

export function createNotification(intent: NotificationIntent, data: NotificationData) {
    const id = '_' + crypto.randomUUID()
    const fragment = cloneElement(notificationEntryTemplate.content)
    const node = querySelector(fragment, '.notification-entry')
    node.id = id
    node.classList.add(intent)
    const el = getNotificationElements(node)
    el.description.textContent = data.description
    el.title.textContent = data.title
    const vdata: NotificationPrivates = {
        data: {
            retry: data.retry
        },
        actions: {
            dismiss() {
                deleteNotification(id)
            },
            retry() {
                data.retry?.()
            },
        }
    }
    vtable.set(node, vdata)
    el.actions.dismiss.addEventListener('click', vdata.actions.dismiss)
    el.actions.retry.addEventListener('click', vdata.actions.retry)
    el.actions.retry.hidden = typeof data.retry !== 'function'
    notificationList.append(node)
    return id
}

export function updateNotification(id: string, data: Partial<NotificationData> & { intent?: NotificationIntent }) {
    const node = document.getElementById(id)
    if (!node) {
        return
    }
    const vdata = vtable.get(node)
    if (!vdata) {
        return
    }
    vdata.data.retry = data.retry
    const el = getNotificationElements(node)
    el.description.textContent = data.description ?? el.description.textContent
    el.title.textContent = data.title ?? el.title.textContent
    el.actions.retry.hidden = typeof data.retry !== 'function'
}

export function deleteNotification(id: string) {
    const node = getElementById(document, id)
    const vdata = vtable.get(node)
    if (!vdata) {
        return
    }
    const el = getNotificationElements(node)
    el.actions.dismiss.removeEventListener('click', vdata.actions.dismiss)
    el.actions.retry.removeEventListener('click', vdata.actions.retry)
    vtable.delete(node)
    node.remove()
}