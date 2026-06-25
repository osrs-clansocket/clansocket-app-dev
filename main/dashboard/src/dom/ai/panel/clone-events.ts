import { executeActions } from "../../../ai/actions/action-executor";
import { buildSyncActions, syncInputState, withClone } from "./clone-classifier.js";

const FORWARDED_KEYS: ReadonlySet<string> = new Set([
    "Enter",
    "Escape",
    "Tab",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
]);

function wireClick(history: HTMLElement): void {
    history.addEventListener("click", (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        withClone(target, (_el, key) => {
            event.preventDefault();
            void executeActions({ click: key });
        });
    });
}

function wireChange(history: HTMLElement): void {
    history.addEventListener("change", (event: Event) => {
        withClone(event.target, (el, key) => {
            if (!(el instanceof HTMLElement)) return;
            syncInputState(el, key);
        });
    });
}

function wireSubmit(history: HTMLElement): void {
    history.addEventListener("submit", (event: Event) => {
        withClone(event.target, (el, key) => {
            if (!(el instanceof HTMLFormElement)) return;
            event.preventDefault();
            void executeActions(buildSyncActions(el), { silent: true });
            void executeActions({ submit: key });
        });
    });
}

function wireKeydown(history: HTMLElement): void {
    history.addEventListener("keydown", (event: KeyboardEvent) => {
        if (!FORWARDED_KEYS.has(event.key)) return;
        withClone(event.target, (el, key) => {
            if (event.key === "Enter" && el instanceof HTMLElement) {
                syncInputState(el, key);
            }
            void executeActions({ pressKey: [{ target: key, key: event.key }] });
        });
    });
}

function wireToggle(history: HTMLElement): void {
    history.addEventListener(
        "toggle",
        (event: Event) => {
            withClone(event.target, (el, key) => {
                if (!(el instanceof HTMLDetailsElement)) return;
                void executeActions({ toggleOpen: [{ target: key, open: el.open }] });
            });
        },
        true,
    );
}

function wireCloneEvents(history: HTMLElement): void {
    wireClick(history);
    wireChange(history);
    wireSubmit(history);
    wireKeydown(history);
    wireToggle(history);
}

export { wireCloneEvents };
