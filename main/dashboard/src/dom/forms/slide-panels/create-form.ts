import {
    BTN_VARIANT_BARE,
    button,
    derived,
    div,
    paragraph,
    signal,
    slidePanel,
    wireClick,
    wireSubmit,
    type Instance,
    type SlidePanelInstance,
    baseProps,
} from "../../factory";
import { form as formEl } from "../../factory/content-ops/form/form-textarea.js";
import { FORM_CLAIM_FORM, FORM_ERROR } from "../form-classes.js";

const TOOLBAR_BTN_CLASS = "clans-manage__discord-toolbar-btn";
const PANEL_ACTION_BTN_CLASS = TOOLBAR_BTN_CLASS;
const FOOTER_HOST_CLASS = "slide-panel__footer";

const DEFAULT_CANCEL_LABEL = "Cancel";

export interface CreateFormOptions {
    triggerLabel: string;
    triggerContext: string;
    submitLabel: string;
    submitContext: string;
    cancelLabel?: string;
    buildFields: () => readonly Instance[];
    onSubmit: () => Promise<string | undefined>;
    onPanelOpen?: (inst: SlidePanelInstance) => void;
    onPanelClose?: () => void;
}

interface CreateFormState {
    panelHost: Instance;
    footerHost: Instance;
    panelInstRef: { v: SlidePanelInstance | null };
    opts: CreateFormOptions;
}

interface SubmitWiring {
    formNode: Instance;
    submitBtn: Instance<HTMLButtonElement>;
    errorSig: ReturnType<typeof signal<string>>;
    errorEl: Instance;
}

function wireFormSubmit(state: CreateFormState, w: SubmitWiring): void {
    wireSubmit(w.formNode.el as HTMLFormElement, (e) => {
        e.preventDefault();
        w.submitBtn.el.disabled = true;
        void state.opts
            .onSubmit()
            .then((error) => {
                if (error === undefined) {
                    state.panelInstRef.v?.close();
                    return;
                }
                w.errorSig.set(error);
                w.errorEl.el.hidden = false;
            })
            .finally(() => {
                w.submitBtn.el.disabled = false;
            });
    });
    wireClick(w.submitBtn.el, () => (w.formNode.el as HTMLFormElement).requestSubmit());
}

function buildFormButtons(state: CreateFormState): { cancelBtn: Instance; submitBtn: Instance<HTMLButtonElement> } {
    const cancelBtn = button({
        classes: [PANEL_ACTION_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: state.opts.cancelLabel ?? DEFAULT_CANCEL_LABEL,
        context: "cancel the form and close the slide-panel",
        meta: ["action"],
        onClick: () => state.panelInstRef.v?.close(),
    });
    const submitBtn: Instance<HTMLButtonElement> = button({
        classes: [PANEL_ACTION_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        type: "button",
        text: state.opts.submitLabel,
        context: state.opts.submitContext,
        meta: ["submit"],
    });
    return { cancelBtn, submitBtn };
}

function renderForm(state: CreateFormState): void {
    const errorSig = signal<string>("");
    const errorEl = paragraph({
        classes: [FORM_ERROR],
        text: derived(() => errorSig()),
        hidden: "",
        context: null,
        meta: null,
    });
    const { cancelBtn, submitBtn } = buildFormButtons(state);
    const formNode = formEl(baseProps([FORM_CLAIM_FORM]), [...state.opts.buildFields(), errorEl]);
    wireFormSubmit(state, { formNode, submitBtn, errorSig, errorEl });
    state.panelHost.setChildren(formNode);
    state.footerHost.setChildren(submitBtn, cancelBtn);
    state.footerHost.el.hidden = false;
}

function makePanelHandlers(state: CreateFormState): { onOpen: () => void; onClose: () => void } {
    return {
        onOpen: () => {
            renderForm(state);
            if (state.panelInstRef.v !== null) state.opts.onPanelOpen?.(state.panelInstRef.v);
        },
        onClose: () => {
            state.panelHost.clear();
            state.footerHost.clear();
            state.footerHost.el.hidden = true;
            state.opts.onPanelClose?.();
        },
    };
}

export function buildCreateForm(opts: CreateFormOptions): SlidePanelInstance {
    const panelHost = div(baseProps([]));
    const footerHost = div(baseProps([FOOTER_HOST_CLASS]));
    footerHost.el.hidden = true;
    const panelInstRef: { v: SlidePanelInstance | null } = { v: null };
    const state: CreateFormState = { panelHost, footerHost, panelInstRef, opts };
    const trigger = button({
        classes: [TOOLBAR_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: opts.triggerLabel,
        context: opts.triggerContext,
        meta: ["action"],
    });
    const handlers = makePanelHandlers(state);
    const panelInst = slidePanel({ ...handlers, context: null, meta: null }, trigger, panelHost);
    panelInstRef.v = panelInst;
    panelInst.addChild(footerHost);
    return panelInst;
}
