import type {
    ChangeProp,
    ClickProp,
    FocusProp,
    HandlerDescriptor,
    InputProp,
    KeyProp,
    WheelProp,
} from "./handler-types.js";
import { resolveProp } from "./prop-resolver.js";

function wireSimple<T>(el: HTMLElement, evt: string, prop: T | HandlerDescriptor<T>): void {
    const { handler, options } = resolveProp(prop);
    el.addEventListener(evt, handler as EventListener, options);
}

export function wireInput(el: HTMLElement, prop: InputProp): void {
    wireSimple(el, "input", prop);
}

export function wireChange(el: HTMLElement, prop: ChangeProp): void {
    wireSimple(el, "change", prop);
}

export function wireKey(el: HTMLElement, evt: "keydown" | "keyup" | "keypress", prop: KeyProp): void {
    wireSimple(el, evt, prop);
}

export function wireFocus(el: HTMLElement, evt: "focus" | "blur", prop: FocusProp): void {
    wireSimple(el, evt, prop);
}

export function wireDblClick(el: HTMLElement, prop: ClickProp): void {
    wireSimple(el, "dblclick", prop);
}

export function wireWheel(el: HTMLElement, prop: WheelProp): void {
    wireSimple(el, "wheel", prop);
}
