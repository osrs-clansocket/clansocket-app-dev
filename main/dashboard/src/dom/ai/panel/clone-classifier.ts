import { executeActions } from "../../../ai/actions/action-executor";
import type { Actions, CheckOp, SelectOptionOp, SetValueOp } from "../../../ai/actions/action-types";
import { visitInput, type InputVisitor } from "./clone-visitor.js";

export { isTextInput, isToggleable } from "./clone-input-classify.js";

export const CLONE_KEY_ATTR = "data-ai-clone";
export const CLONE_SELECTOR = `[${CLONE_KEY_ATTR}]`;

export function getCloneKey(el: Element): string | null {
    const clone = el.closest(CLONE_SELECTOR);
    if (clone === null) return null;
    const key = clone.getAttribute(CLONE_KEY_ATTR);
    return key !== null && key.length > 0 ? key : null;
}

export function withClone(target: EventTarget | null, fn: (el: Element, key: string) => void): void {
    if (!(target instanceof Element)) return;
    const key = getCloneKey(target);
    if (key === null) return;
    fn(target, key);
}

export function syncInputState(el: HTMLElement, key: string): void {
    visitInput(el, key, {
        onToggle: (e, k) => void executeActions({ check: [{ target: k, checked: e.checked }] }),
        onSelect: (e, k) => void executeActions({ selectOption: [{ target: k, value: e.value }] }),
        onText: (e, k) => void executeActions({ setValue: [{ target: k, value: e.value }] }),
    });
}

export function buildSyncActions(form: HTMLFormElement): Actions {
    const setValue: SetValueOp[] = [];
    const check: CheckOp[] = [];
    const selectOption: SelectOptionOp[] = [];
    const visitor: InputVisitor = {
        onToggle: (e, k) => check.push({ target: k, checked: e.checked }),
        onSelect: (e, k) => selectOption.push({ target: k, value: e.value }),
        onText: (e, k) => setValue.push({ target: k, value: e.value }),
    };
    for (const el of form.querySelectorAll<HTMLElement>(CLONE_SELECTOR)) {
        const key = el.getAttribute(CLONE_KEY_ATTR);
        if (key === null || key.length === 0) continue;
        visitInput(el, key, visitor);
    }
    return { setValue, check, selectOption };
}
