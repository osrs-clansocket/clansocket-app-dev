import { createInstance } from "./core/instance.js";
import type { Instance } from "./core/types.js";

export type SlotPath = readonly number[];

export interface TemplateSlot {
    readonly path: SlotPath;
}

export interface TemplateConfig<Props> {
    readonly name: string;
    readonly master: () => { root: HTMLElement; slots: Record<string, TemplateSlot> };
    readonly patch: (rootEl: HTMLElement, slotEls: Record<string, Node>, props: Props) => void;
    readonly wire?: (rootEl: HTMLElement, slotEls: Record<string, Node>, instance: Instance, props: Props) => void;
}

export interface Template<Props> {
    readonly name: string;
    instantiate(props: Props): Instance;
}

function nodeAtPath(root: Node, path: SlotPath): Node {
    let current: Node = root;
    for (const idx of path) {
        const child = current.childNodes[idx];
        if (child === undefined) {
            throw new Error(`template: slot path ${path.join("/")} out of bounds at index ${idx}`);
        }
        current = child;
    }
    return current;
}

export function defineTemplate<Props>(config: TemplateConfig<Props>): Template<Props> {
    const built = config.master();
    const masterRoot = built.root;
    const slotPaths = built.slots;
    return {
        name: config.name,
        instantiate(props: Props): Instance {
            const cloneRoot = masterRoot.cloneNode(true) as HTMLElement;
            const slotEls: Record<string, Node> = {};
            for (const [name, slot] of Object.entries(slotPaths)) {
                slotEls[name] = nodeAtPath(cloneRoot, slot.path);
            }
            config.patch(cloneRoot, slotEls, props);
            const instance = createInstance(cloneRoot);
            config.wire?.(cloneRoot, slotEls, instance, props);
            return instance;
        },
    };
}

export function pathFromRoot(root: Node, target: Node): SlotPath {
    const path: number[] = [];
    let current: Node | null = target;
    while (current !== null && current !== root) {
        const parent: Node | null = current.parentNode;
        if (parent === null)
            throw new Error(
                `template.pathFor: target is not a descendant of root (targetTag=${(target as Element).tagName ?? "?"})`,
            );
        let index = 0;
        let sibling: Node | null = parent.firstChild;
        while (sibling !== null && sibling !== current) {
            index++;
            sibling = sibling.nextSibling;
        }
        path.unshift(index);
        current = parent;
    }
    if (current === null)
        throw new Error(
            `template.pathFor: target is not a descendant of root (rootTag=${(root as Element).tagName ?? "?"})`,
        );
    return path;
}
