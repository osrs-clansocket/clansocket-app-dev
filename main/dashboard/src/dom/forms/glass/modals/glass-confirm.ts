import {
    button,
    createInstance,
    div,
    heading,
    modal,
    paragraph,
    type Instance,
    baseProps,
} from "../../../factory/index.js";
import { isEnter } from "../../keys.js";

const CLASS_OVERLAY = "glass-confirm__overlay";
const CLASS_DIALOG = "glass-confirm";
const CLASS_OPEN = "glass-confirm--open";
const CLASS_TITLE = "glass-confirm__title";
const CLASS_MESSAGE = "glass-confirm__message";
const CLASS_ACTIONS = "glass-confirm__actions";
const CLASS_BTN = "glass-confirm__btn";
const CLASS_BTN_CANCEL = "glass-confirm__btn--cancel";
const CLASS_BTN_CONFIRM = "glass-confirm__btn--confirm";
const CLASS_BTN_DANGER = "glass-confirm__btn--danger";
const CLOSE_RESOLVE_DELAY_MS = 220;

interface ConfirmOptions {
    title?: string;
    message: string;
    cancelLabel?: string;
    confirmLabel?: string;
    danger?: boolean;
}

interface ConfirmDefaults {
    title: string;
    message: string;
    cancelLabel: string;
    confirmLabel: string;
    danger: boolean;
}

function resolveDefaults(options: ConfirmOptions): ConfirmDefaults {
    return {
        title: options.title ?? "Confirm",
        message: options.message,
        cancelLabel: options.cancelLabel ?? "Cancel",
        confirmLabel: options.confirmLabel ?? "Confirm",
        danger: Boolean(options.danger),
    };
}

function buildConfirmBtns(args: { d: ConfirmDefaults; settle: (r: boolean) => void }): {
    cancelBtn: Instance<HTMLButtonElement>;
    confirmBtn: Instance<HTMLButtonElement>;
} {
    const { d, settle } = args;
    const cancelBtn = button({
        classes: [CLASS_BTN, CLASS_BTN_CANCEL],
        text: d.cancelLabel,
        context: "cancel and dismiss the dialog",
        meta: ["action"],
        onClick: () => settle(false),
    });
    const confirmBtn = button({
        classes: d.danger ? [CLASS_BTN, CLASS_BTN_CONFIRM, CLASS_BTN_DANGER] : [CLASS_BTN, CLASS_BTN_CONFIRM],
        text: d.confirmLabel,
        context: "confirm the action",
        meta: d.danger ? ["destructive"] : ["submit"],
        onClick: () => settle(true),
    });
    return { cancelBtn, confirmBtn };
}

function buildConfirmContent(d: ConfirmDefaults, actions: Instance): Instance[] {
    return [
        heading("h2", { classes: [CLASS_TITLE], text: d.title, id: "glass-confirm-title", context: null, meta: null }),
        paragraph({ classes: [CLASS_MESSAGE], text: d.message, id: "glass-confirm-msg", context: null, meta: null }),
        actions,
    ];
}

function wireConfirmAria(
    m: ReturnType<typeof modal>,
    confirmBtn: Instance<HTMLButtonElement>,
    settle: (r: boolean) => void,
): void {
    const dialogInst = createInstance(m.dialogEl);
    dialogInst.setAttr("role", "alertdialog");
    dialogInst.setAttr("aria-modal", "true");
    dialogInst.setAttr("aria-labelledby", "glass-confirm-title");
    dialogInst.setAttr("aria-describedby", "glass-confirm-msg");
    m.dialogEl.addEventListener("keydown", (e) => {
        if (isEnter(e) && document.activeElement === confirmBtn.el) {
            e.preventDefault();
            settle(true);
        }
    });
}

function buildConfirmModal(args: {
    d: ConfirmDefaults;
    cancelBtn: Instance<HTMLButtonElement>;
    confirmBtn: Instance<HTMLButtonElement>;
    settle: (r: boolean) => void;
}): ReturnType<typeof modal> {
    const { d, cancelBtn, confirmBtn, settle } = args;
    const actions = div(baseProps([CLASS_ACTIONS]), [cancelBtn, confirmBtn]);
    return modal(
        {
            overlayClasses: [CLASS_OVERLAY],
            dialogClasses: [CLASS_DIALOG],
            openClass: CLASS_OPEN,
            context: null,
            meta: null,
            onClose: () => settle(false),
            initialFocus: () => cancelBtn.el,
        },
        buildConfirmContent(d, actions),
    );
}

function glassConfirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const d = resolveDefaults(options);
        let settled = false;
        const mRef: { m: ReturnType<typeof modal> | null } = { m: null };
        const settle = (result: boolean): void => {
            if (settled) return;
            settled = true;
            mRef.m?.dismiss();
            window.setTimeout(() => resolve(result), CLOSE_RESOLVE_DELAY_MS);
        };
        const { cancelBtn, confirmBtn } = buildConfirmBtns({ d, settle });
        const m = buildConfirmModal({ d, cancelBtn, confirmBtn, settle });
        mRef.m = m;
        wireConfirmAria(m, confirmBtn, settle);
        createInstance(document.body).addChild(m);
        m.open();
    });
}

export { glassConfirm };
export type { ConfirmOptions };
