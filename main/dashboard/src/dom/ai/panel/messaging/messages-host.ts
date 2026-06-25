import { createInstance, type Instance } from "../../../factory";

const HOSTS = new WeakMap<HTMLElement, Instance>();

export function getMessagesHost(messagesEl: HTMLElement): Instance {
    let host = HOSTS.get(messagesEl);
    if (host === undefined) {
        host = createInstance(messagesEl);
        HOSTS.set(messagesEl, host);
    }
    return host;
}
