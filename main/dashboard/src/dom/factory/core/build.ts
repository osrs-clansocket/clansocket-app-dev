import { wireClick } from "../events/click-wirer.js";
import { wireSubmit } from "../events/submit-wirer.js";
import { wireChange, wireDblClick, wireFocus, wireInput, wireKey } from "../events/simple-wirer.js";
import { applyEffects } from "../effects/effect-applier.js";
import type { ReactiveValue } from "../reactive/index";
import { applyAttrs, applyText } from "../reactive/reactive-dom";
import { autoKeyFor } from "./sanitizers/auto-key.js";
import { createInstance } from "./instance.js";
import { ARIA_PROP_TO_ATTR, HTML_ATTR_PROPS } from "./attr-mappings.js";
import type { BuildSpec, Child, Instance } from "./types.js";

function applyClasses(el: HTMLElement, classes: readonly string[] | undefined): void {
    if (classes && classes.length > 0) el.classList.add(...classes);
}

function applyKey(el: HTMLElement, key: string | undefined, spec: BuildSpec): void {
    const finalKey = key ?? autoKeyFor(spec);
    if (finalKey) {
        el.dataset.key = finalKey;
        el.dataset.auditTarget = finalKey;
    }
}

function applyContext(el: HTMLElement, spec: BuildSpec): void {
    if (spec.context) el.dataset.context = spec.context;
    if (spec.meta && spec.meta.length > 0) el.dataset.meta = spec.meta.join(" ");
}

function mergeBuildAttrs(spec: BuildSpec): Record<string, ReactiveValue<string>> | undefined {
    const specRecord = spec as unknown as Record<string, ReactiveValue<string> | undefined>;
    let merged: Record<string, ReactiveValue<string>> | undefined;

    const ensure = (): Record<string, ReactiveValue<string>> => {
        if (!merged) merged = spec.attrs ? { ...spec.attrs } : {};
        return merged;
    };

    for (const propName of Object.keys(ARIA_PROP_TO_ATTR)) {
        const value = specRecord[propName];
        if (value !== undefined) ensure()[ARIA_PROP_TO_ATTR[propName]!] = value;
    }
    for (const attrName of HTML_ATTR_PROPS) {
        const value = specRecord[attrName];
        if (value !== undefined) ensure()[attrName] = value;
    }
    if (spec.data) {
        const target = ensure();
        for (const [k, v] of Object.entries(spec.data)) target[`data-${k}`] = v;
    }

    return merged ?? spec.attrs;
}

function attachChildren(inst: Instance<HTMLElement>, spec: BuildSpec, children?: readonly Child[]): void {
    if (spec.children) for (const child of spec.children) inst.addChild(child);
    if (children) for (const child of children) inst.addChild(child);
}

function wireMouseClicks<T extends HTMLElement>(el: T, spec: BuildSpec): void {
    if (spec.onClick) wireClick(el, spec.onClick);
    if (spec.onDblClick) wireDblClick(el, spec.onDblClick);
    if (spec.onSubmit) wireSubmit(el as unknown as HTMLFormElement, spec.onSubmit);
    if (spec.onInput) wireInput(el, spec.onInput);
    if (spec.onChange) wireChange(el, spec.onChange);
}

function wireKeyEvents<T extends HTMLElement>(el: T, spec: BuildSpec): void {
    if (spec.onKeydown) wireKey(el, "keydown", spec.onKeydown);
    if (spec.onKeyup) wireKey(el, "keyup", spec.onKeyup);
    if (spec.onKeypress) wireKey(el, "keypress", spec.onKeypress);
    if (spec.onBlur) wireFocus(el, "blur", spec.onBlur);
    if (spec.onFocus) wireFocus(el, "focus", spec.onFocus);
}

export function build<T extends HTMLElement>(spec: BuildSpec, children?: readonly Child[]): Instance<T> {
    const el = document.createElement(spec.tag) as T;
    const inst = createInstance<T>(el);
    applyClasses(el, spec.classes);
    applyAttrs(el, mergeBuildAttrs(spec), inst);
    applyKey(el, spec.key, spec);
    applyContext(el, spec);
    applyText(el, spec.text, inst);
    attachChildren(inst, spec, children);
    wireMouseClicks(el, spec);
    wireKeyEvents(el, spec);
    if (spec.effects !== undefined) applyEffects(el, spec.effects);
    return inst;
}
