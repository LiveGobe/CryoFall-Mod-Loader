// @ts-check
import { createSignal } from "../signal/index.js"

export class Watchable {
    static fromInput(target) {
        if (target instanceof HTMLSelectElement) {
            const watchable = new Watchable(target.value)
            target.addEventListener('change', () => {
                watchable.setValue(target.value)
            })
            return watchable
        } else if (target instanceof HTMLInputElement) {
            switch (target.type) {
                case 'radio':
                    throw new Error('unsupported')
                case 'checkbox':
                    throw new Error('unsupported')
                default: {
                    const out = new Watchable(target.value)
                    target.addEventListener('input', () => {
                        out.setValue(target.value)
                    })
                    return out
                }
            }
        } else if (target instanceof HTMLTextAreaElement) {
            const watchable = new Watchable(target.value)
            target.addEventListener('change', () => {
                watchable.setValue(target.value)
            })
            return watchable
        }
        throw new Error('target is not instance of HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement')
    }
    #value
    constructor(value) {
        this.#value = value
        this.update = createSignal()
    }
    get value() {
        return this.getValue()
    }
    set value(value) {
        this.setValue(value)
    }
    setValue(value) {
        this.#value = value
        this.update(value)
    }
    getValue() {
        return this.#value
    }
}