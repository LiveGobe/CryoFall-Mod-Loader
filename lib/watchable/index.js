// @ts-check
import { createSignal } from "../signal/index.js"

export class Watchable {
    static fromInput(target, ofType) {
        if (target instanceof HTMLSelectElement) {
            const watchable = new Watchable(target.value, ofType)
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
    #ofType
    constructor(value, ofType) {
        if (ofType(value)) {
            this.#value = value
            this.#ofType = ofType
        } else {
            throw new Error(`unable to create watchable with value ${value}`)
        }
        this.update = createSignal()
    }
    get value() {
        return this.getValue()
    }
    set value(value) {
        this.setValue(value)
    }
    setValue(value) {
        if (this.#ofType(value)) {
            this.#value = value
            this.update(value)
        }
    }
    getValue() {
        return this.#value
    }
}