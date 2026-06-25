import { addEffectClass, removeEffectClass } from "../effects/class-applier.js";
import { type Disposable } from "../reactive/index";
import { writeAttr, writeHTML, writeText } from "../reactive/reactive-dom";
import type { Child, Instance } from "./types.js";

export function toNode(child: Child): Node {
    if (typeof child === "string") return document.createTextNode(child);
    if (child instanceof Element) return child;
    return child.el;
}

export function chain<T>(self: T, op: () => void): T {
    op();
    return self;
}

function isInstanceChild(child: Child): child is Instance {
    return typeof child !== "string" && !(child instanceof Element);
}

function disposeRemovedInstances(parent: HTMLElement, tracked: Set<Instance>, keep: Set<Instance> | null): void {
    for (const inst of tracked) {
        const stillKept = keep !== null && keep.has(inst);
        const detached = inst.el.parentElement !== parent;
        if (!stillKept && !detached) inst.destroy();
    }
}

function wireSingleAdd<T extends HTMLElement>(self: Instance<T>, el: T, tracked: Set<Instance>): void {
    self.addChild = (child) =>
        chain(self, () => {
            if (isInstanceChild(child)) tracked.add(child);
            el.appendChild(toNode(child));
        });
    self.addFirst = (child) =>
        chain(self, () => {
            if (isInstanceChild(child)) tracked.add(child);
            el.insertBefore(toNode(child), el.firstChild);
        });
    self.addBefore = (child, ref) =>
        chain(self, () => {
            if (isInstanceChild(child)) tracked.add(child);
            el.insertBefore(toNode(child), ref);
        });
}

function wireBatchAdd<T extends HTMLElement>(self: Instance<T>, el: T, tracked: Set<Instance>): void {
    self.addBatchBefore = (children, ref) =>
        chain(self, () => {
            if (children.length === 0) return;
            const frag = document.createDocumentFragment();
            for (const child of children) {
                if (isInstanceChild(child)) tracked.add(child);
                frag.appendChild(toNode(child));
            }
            el.insertBefore(frag, ref);
        });
}

function wireAppendOps<T extends HTMLElement>(self: Instance<T>, el: T, tracked: Set<Instance>): void {
    wireSingleAdd(self, el, tracked);
    wireBatchAdd(self, el, tracked);
}

function wireReplaceOps<T extends HTMLElement>(self: Instance<T>, el: T, tracked: Set<Instance>): void {
    self.setChildren = (...children) =>
        chain(self, () => {
            const keep = new Set<Instance>();
            for (const child of children) {
                if (isInstanceChild(child)) keep.add(child);
            }
            disposeRemovedInstances(el, tracked, keep);
            tracked.clear();
            el.replaceChildren();
            for (const child of children) {
                if (isInstanceChild(child)) tracked.add(child);
                el.appendChild(toNode(child));
            }
        });
    self.clear = () =>
        chain(self, () => {
            disposeRemovedInstances(el, tracked, null);
            tracked.clear();
            el.replaceChildren();
        });
}

function buildChildOps<T extends HTMLElement>(self: Instance<T>, el: T, tracked: Set<Instance>): void {
    wireAppendOps(self, el, tracked);
    wireReplaceOps(self, el, tracked);
}

function buildAttrOps<T extends HTMLElement>(self: Instance<T>, el: T): void {
    self.setText = (text) => chain(self, () => writeText(el, text, self));
    self.setHTML = (html) => chain(self, () => writeHTML(el, html, self));
    self.setAttr = (name, value) => chain(self, () => writeAttr(el, name, value, self));
    self.removeAttr = (name) => chain(self, () => el.removeAttribute(name));
    self.toggleClass = (className, force) =>
        chain(self, () => {
            el.classList.toggle(className, force);
        });
    self.addEffect = (name) => chain(self, () => addEffectClass(el, name));
    self.removeEffect = (name) => chain(self, () => removeEffectClass(el, name));
}

export function createInstance<T extends HTMLElement>(el: T): Instance<T> {
    const disposers: Disposable[] = [];
    const tracked = new Set<Instance>();
    const self = { el } as Instance<T>;
    self.mount = (parent) => chain(self, () => parent.appendChild(el));
    self.detach = () => chain(self, () => el.remove());
    self.destroy = () => {
        for (const inst of tracked) {
            if (inst.el.parentElement === el) inst.destroy();
        }
        tracked.clear();
        for (const d of disposers) d.dispose();
        disposers.length = 0;
        el.remove();
    };
    self.trackDispose = (d) =>
        chain(self, () => {
            disposers.push(d);
        });
    buildAttrOps(self, el);
    buildChildOps(self, el, tracked);
    return self;
}
