import { effect, isSignal, type EffectOwner, type ReactiveValue, type ReadSignal } from "./index.js";
import { scheduleText as schedText, scheduleHtml as schedHtml, scheduleAttr as schedAttr } from "../scheduler/index";
import { trustHTML } from "../core/sanitizers/trust-html.js";

export function writeText(el: HTMLElement, value: ReactiveValue<string>, owner: EffectOwner): void {
    if (isSignal(value)) {
        owner.trackDispose(
            effect(() => {
                const v = (value as ReadSignal<string>)();
                if (el.isConnected) schedText(el, v);
                else el.textContent = v;
            }),
        );
        return;
    }
    el.textContent = value;
}

export function writeHTML(el: HTMLElement, value: ReactiveValue<string>, owner: EffectOwner): void {
    if (isSignal(value)) {
        owner.trackDispose(
            effect(() => {
                const v = (value as ReadSignal<string>)();
                if (el.isConnected) schedHtml(el, v);
                else el.innerHTML = trustHTML(v) as string;
            }),
        );
        return;
    }
    el.innerHTML = trustHTML(value) as string;
}

const ATTR_STYLE = "style";

function applyAttrImmediate(el: HTMLElement, name: string, value: string | null): void {
    if (name === ATTR_STYLE) {
        el.style.cssText = value ?? "";
        return;
    }
    if (value === null) el.removeAttribute(name);
    else el.setAttribute(name, value);
}

export function writeAttr(
    el: HTMLElement,
    name: string,
    value: ReactiveValue<string | null>,
    owner: EffectOwner,
): void {
    if (isSignal(value)) {
        owner.trackDispose(
            effect(() => {
                const v = (value as ReadSignal<string | null>)();
                if (el.isConnected) schedAttr(el, name, v);
                else applyAttrImmediate(el, name, v);
            }),
        );
        return;
    }
    applyAttrImmediate(el, name, value);
}

export function applyText(el: HTMLElement, text: ReactiveValue<string> | undefined, owner: EffectOwner): void {
    if (text === undefined) return;
    writeText(el, text, owner);
}

export function applyAttrs(
    el: HTMLElement,
    attrs: Record<string, ReactiveValue<string>> | undefined,
    owner: EffectOwner,
): void {
    if (!attrs) return;
    for (const [k, v] of Object.entries(attrs)) writeAttr(el, k, v, owner);
}
