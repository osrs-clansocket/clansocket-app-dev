import { button, div, input, type Instance } from "../../../dom/factory/index.js";
import {
    MODAL_CARD_BODY_CLASS,
    MODAL_CARD_BTN_CLASS,
    MODAL_CARD_BTN_DANGER_MOD,
    MODAL_CARD_BTN_PRIMARY_MOD,
    MODAL_CARD_BTN_SECONDARY_MOD,
    MODAL_CARD_BUTTONS_CLASS,
    MODAL_CARD_CLASS,
    MODAL_CARD_INPUT_CLASS,
    MODAL_CARD_TITLE_CLASS,
    MODAL_OVERLAY_CLASS,
} from "../../../shared/constants/voxlab/voxlab-classes-constants.js";

export type ModalRole = "primary" | "secondary" | "danger";

export interface ModalButton {
    label: string;
    role: ModalRole;
    value: string | boolean | null;
}

export interface ModalSpec {
    title: string;
    body?: string;
    input?: { defaultValue: string };
    buttons: ModalButton[];
}

export type ModalResolve = (value: string | boolean | null) => void;

const MODAL_ROLE_MOD: Record<ModalRole, string> = {
    primary: MODAL_CARD_BTN_PRIMARY_MOD,
    secondary: MODAL_CARD_BTN_SECONDARY_MOD,
    danger: MODAL_CARD_BTN_DANGER_MOD,
};

export function buildInput(defaultValue: string): Instance<HTMLInputElement> {
    return input({
        classes: [MODAL_CARD_INPUT_CLASS],
        type: "text",
        value: defaultValue,
        ariaLabel: "modal prompt input",
        context: "voxlab modal text input — value resolves the prompt promise",
        meta: ["input"],
    });
}

function buildButtonRow(
    spec: ModalSpec,
    inputInstance: Instance<HTMLInputElement> | null,
    cleanup: ModalResolve,
): Instance {
    const buttonEls: HTMLElement[] = [];
    for (const btn of spec.buttons) {
        const btnInst = button({
            classes: [MODAL_CARD_BTN_CLASS, MODAL_ROLE_MOD[btn.role]],
            text: btn.label,
            type: "button",
            context: `voxlab modal button — ${btn.label.toLowerCase()}`,
            meta: ["action"],
            onClick: () => {
                if (inputInstance && btn.value === "") {
                    cleanup(inputInstance.el.value);
                } else {
                    cleanup(btn.value);
                }
            },
        });
        buttonEls.push(btnInst.el);
    }
    return div({ classes: [MODAL_CARD_BUTTONS_CLASS], context: null, meta: null }, buttonEls);
}

function buildCard(spec: ModalSpec, inputInstance: Instance<HTMLInputElement> | null, cleanup: ModalResolve): Instance {
    const children: HTMLElement[] = [];
    children.push(div({ classes: [MODAL_CARD_TITLE_CLASS], text: spec.title, context: null, meta: null }).el);
    if (spec.body) {
        children.push(div({ classes: [MODAL_CARD_BODY_CLASS], text: spec.body, context: null, meta: null }).el);
    }
    if (inputInstance) children.push(inputInstance.el);
    children.push(buildButtonRow(spec, inputInstance, cleanup).el);
    return div({ classes: [MODAL_CARD_CLASS], context: null, meta: null }, children);
}

function resolveModalKey(
    spec: ModalSpec,
    inputInstance: Instance<HTMLInputElement> | null,
    resolve: ModalResolve,
): void {
    if (inputInstance) resolve(inputInstance.el.value);
    else resolve(spec.buttons[spec.buttons.length - 1].value);
}

function makeClickHandler(
    overlayRef: { current: Instance | null },
    spec: ModalSpec,
    resolve: ModalResolve,
): (e: MouseEvent) => void {
    return (e) => {
        if (overlayRef.current && e.target === overlayRef.current.el) {
            overlayRef.current.detach();
            resolve(spec.input ? null : false);
        }
    };
}

function makeKeyHandler(
    overlayRef: { current: Instance | null },
    spec: ModalSpec,
    inputInstance: Instance<HTMLInputElement> | null,
    resolve: ModalResolve,
): (e: KeyboardEvent) => void {
    return (e) => {
        if (!overlayRef.current) return;
        if (e.key === "Escape") {
            overlayRef.current.detach();
            resolve(spec.input ? null : false);
        } else if (e.key === "Enter") {
            overlayRef.current.detach();
            resolveModalKey(spec, inputInstance, resolve);
        }
    };
}

export function buildOverlay(
    spec: ModalSpec,
    inputInstance: Instance<HTMLInputElement> | null,
    resolve: ModalResolve,
): Instance {
    const overlayRef: { current: Instance | null } = { current: null };
    const card = buildCard(spec, inputInstance, (value) => {
        overlayRef.current?.detach();
        resolve(value);
    });
    const overlay = div(
        {
            classes: [MODAL_OVERLAY_CLASS],
            tabindex: "-1",
            context: "voxlab modal overlay — click outside to dismiss, esc/enter to resolve",
            meta: ["modal"],
            onClick: makeClickHandler(overlayRef, spec, resolve),
            onKeydown: makeKeyHandler(overlayRef, spec, inputInstance, resolve),
        },
        [card.el],
    );
    overlayRef.current = overlay;
    return overlay;
}
