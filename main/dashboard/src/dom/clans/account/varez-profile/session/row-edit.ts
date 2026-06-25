import { div, flashInvalid, input, textarea, type Instance } from "../../../../factory";
import { profileStore, type SessionEntry } from "../../../../../ai/profile-store";
import {
    INLINE_INPUT_CLASS,
    INLINE_INPUT_INVALID_CLASS,
    LIST_ROW_CLASS,
    ROW_ACTIONS_CLASS,
    ROW_CLASS,
    ROW_EDITING_CLASS,
    SESSION_EDIT_GRID_CLASS,
    SURFACE_ROW_CLASS,
    setEditing,
} from "../state.js";
import { iconBtn } from "../shared.js";

interface SessionInputs {
    they: HTMLTextAreaElement;
    i: HTMLTextAreaElement;
    learned: HTMLInputElement;
    fix: HTMLInputElement;
    failure: HTMLInputElement;
}

function buildSessionTextareas(initial: Partial<SessionEntry> | null): {
    theyEl: Instance<HTMLTextAreaElement>;
    iEl: Instance<HTMLTextAreaElement>;
} {
    const theyEl = textarea({
        classes: [INLINE_INPUT_CLASS],
        value: initial?.they ?? "",
        placeholder: "they: what the user signaled",
        rows: "2",
        ariaLabel: "they",
        context: "what the user signaled this turn",
        meta: ["input"],
    });
    const iEl = textarea({
        classes: [INLINE_INPUT_CLASS],
        value: initial?.i ?? "",
        placeholder: "i: what was done in response",
        rows: "2",
        ariaLabel: "i",
        context: "what was done in response",
        meta: ["input"],
    });
    return { theyEl, iEl };
}

function makeOptionalInput(value: string, name: string, contextHint: string): Instance<HTMLInputElement> {
    return input({
        value,
        classes: [INLINE_INPUT_CLASS],
        placeholder: `${name} (optional)`,
        ariaLabel: name,
        context: contextHint,
        meta: ["input"],
    });
}

function buildOptionalInputs(initial: Partial<SessionEntry> | null): {
    learnedEl: Instance<HTMLInputElement>;
    fixEl: Instance<HTMLInputElement>;
    failureEl: Instance<HTMLInputElement>;
} {
    return {
        learnedEl: makeOptionalInput(initial?.learned ?? "", "learned", "what was learned this turn (optional)"),
        fixEl: makeOptionalInput(initial?.fix ?? "", "fix", "the fix applied this turn (optional)"),
        failureEl: makeOptionalInput(initial?.failure ?? "", "failure", "the failure noted this turn (optional)"),
    };
}

function buildSessionInputs(initial: Partial<SessionEntry> | null): SessionInputs & { el: HTMLElement } {
    const { theyEl, iEl } = buildSessionTextareas(initial);
    const { learnedEl, fixEl, failureEl } = buildOptionalInputs(initial);
    const grid = div({ classes: [SESSION_EDIT_GRID_CLASS], context: null, meta: null }, [
        theyEl,
        iEl,
        learnedEl,
        fixEl,
        failureEl,
    ]);
    return { they: theyEl.el, i: iEl.el, learned: learnedEl.el, fix: fixEl.el, failure: failureEl.el, el: grid.el };
}

function collectSessionEntry(inputs: ReturnType<typeof buildSessionInputs>): Omit<SessionEntry, "turn"> | null {
    const they = inputs.they.value.trim();
    const iVal = inputs.i.value.trim();
    if (they.length === 0 || iVal.length === 0) {
        const badEl = they.length === 0 ? inputs.they : inputs.i;
        badEl.classList.add(INLINE_INPUT_INVALID_CLASS);
        flashInvalid(badEl);
        return null;
    }
    const entry: Omit<SessionEntry, "turn"> = { they, i: iVal };
    const learned = inputs.learned.value.trim();
    const fix = inputs.fix.value.trim();
    const failure = inputs.failure.value.trim();
    if (learned.length > 0) entry.learned = learned;
    if (fix.length > 0) entry.fix = fix;
    if (failure.length > 0) entry.failure = failure;
    return entry;
}

function makeSaveSession(
    inputs: ReturnType<typeof buildSessionInputs>,
    initial: SessionEntry | null,
    rerender: () => void,
): () => void {
    return (): void => {
        const entry = collectSessionEntry(inputs);
        if (entry === null) return;
        if (initial === null) profileStore.addSession(entry);
        else profileStore.updateSession(initial.turn, entry);
        setEditing(null);
        rerender();
    };
}

export function editableRow(host: Instance, initial: SessionEntry | null, rerender: () => void): void {
    const inputs = buildSessionInputs(initial);
    const save = makeSaveSession(inputs, initial, rerender);
    const cancel = (): void => {
        setEditing(null);
        rerender();
    };
    const row = div(
        { classes: [ROW_CLASS, ROW_EDITING_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS], context: null, meta: null },
        [
            inputs.el,
            div({ classes: [ROW_ACTIONS_CLASS], context: null, meta: null }, [
                iconBtn("check-lg", "save", save),
                iconBtn("x-lg", "cancel", cancel),
            ]),
        ],
    );
    host.addChild(row);
    queueMicrotask(() => inputs.they.focus());
}
