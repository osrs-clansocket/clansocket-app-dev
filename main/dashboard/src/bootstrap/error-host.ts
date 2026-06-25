import { createInstance, type Instance } from "../dom/factory";
import { ERROR_BANNER_HOST_CLASS } from "../shared/constants/error-banner-constants.js";

const HOST_SELECTOR = `.${ERROR_BANNER_HOST_CLASS}`;
const HOSTS = new WeakMap<HTMLElement, Instance>();

export function findHost(): HTMLElement | null {
    return document.querySelector(HOST_SELECTOR);
}

export function getHost(el: HTMLElement): Instance {
    let host = HOSTS.get(el);
    if (host === undefined) {
        host = createInstance(el);
        HOSTS.set(el, host);
    }
    return host;
}
