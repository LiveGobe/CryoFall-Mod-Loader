// @ts-check

/// <reference path="./index.d.ts" />

import { isInstanceOf } from "../../../lib/guard/index.js"
import { getElementByIdOfType } from "../../../lib/html/index.js"
import { deleteMod } from "../../signals.js"
import { setModEnabled } from "../../signals.js"

export class ModEntryTemplate {
    /**
     * @type {Document}
     */
    #template
    constructor(id) {
        // @ts-expect-error
        this.#template = getElementByIdOfType(id, isInstanceOf(HTMLTemplateElement)).content
    }

    create(data) {
        return new ModEntryComponent(this.#template.cloneNode(true), data)
    }
}

export class ModEntryComponent {
    /** @type {Element} */
    #$root
    /** @type {Text} */
    #$title
    /** @type {Text} */
    #$description
    /** @type {Text} */
    #$author
    /** @type {Text} */
    #$version
    /** @type {Element} */
    #$statusEnabled
    /** @type {Element} */
    #$statusDisabled
    /** @type {HTMLButtonElement} */
    #$buttonSetEnabled
    /** @type {HTMLButtonElement} */
    #$buttonDeleteMod
    constructor(template, data) {
        this.#$root = template.querySelector('.mod-entry')
        if (null == this.#$root) {
            throw new Error('unable initialize this.#$root')
        }
        const $title = template.querySelector('.title')
        if (null == $title) {
            throw new Error('unable initialize this.#$title')
        }
        this.#$title = document.createTextNode('')
        $title.append(this.#$title)
        const $description = template.querySelector('.description')
        if (null == $description) {
            throw new Error('unable initialize this.#$description')
        }
        this.#$description = document.createTextNode('')
        $description.append(this.#$description)
        const $author = template.querySelector('.author')
        if (null == $author) {
            throw new Error('unable initialize this.#$author')
        }
        this.#$author = document.createTextNode('')
        $author.append(this.#$author)
        const $version = template.querySelector('.version')
        if (null == $version) {
            throw new Error('unable initialize this.#$version')
        }
        this.#$version = document.createTextNode('')
        $version.append(this.#$version)
        this.#$statusEnabled = template.querySelector('.status.enabled')
        if (null == this.#$statusEnabled) {
            throw new Error('unable initialize this.#$statusEnabled')
        }
        this.#$statusDisabled = template.querySelector('.status.disabled')
        if (null == this.#$statusDisabled) {
            throw new Error('unable initialize this.#$statusDisabled')
        }
        this.#$buttonDeleteMod = template.querySelector('button[data-action=deleteMod')
        if (null == this.#$buttonDeleteMod) {
            throw new Error('unable initialize this.#$buttonDeleteMod')
        }
        this.#$buttonSetEnabled = template.querySelector('button[data-action=setModEnabled')
        if (null == this.#$buttonSetEnabled) {
            throw new Error('unable initialize this.#$buttonSetEnabled')
        }
        this.#$buttonSetEnabled.addEventListener('click', this.setModEnabled)
        this.#$buttonDeleteMod.addEventListener('click', this.deleteMod)
        this.update(data)
    }

    update(data) {
        this.#$root.id = data.id
        this.#$title.nodeValue = data.title
        this.#$description.nodeValue = data.description
        this.#$author.nodeValue = data.author
        this.#$version.nodeValue = data.version
        this.#$statusEnabled.classList.toggle('hidden', !data.enabled)
        this.#$statusDisabled.classList.toggle('hidden', data.enabled)
    }
    mount(target) {
        target.append(this.#$root)
    }
    unmount()  {
        this.#$root.remove()
    }

    setModEnabled = () => {
        setModEnabled({ modID: this.#$root.id, enabled: this.#$statusEnabled.classList.contains('hidden') })
    }
    deleteMod = () => {
        deleteMod({ modID: this.#$root.id, })
    }
}
