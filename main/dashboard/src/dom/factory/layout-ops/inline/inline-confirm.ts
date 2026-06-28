import { type Instance } from "../../core";
import { button, BTN_VARIANT_OUTLINE } from "../../content-ops/button.js";
import { icon } from "../../content-ops/graphics/media.js";
import { div } from "../structural/container.js";
import { positionOverlay, startOverlay, triggerAnchor } from "./inline-confirm-overlay.js";

const INLINE_CONFIRM_HOST_CLASS = "glass-inline-confirm__host";
const CLASS_PENDING = "glass-inline-confirm";
const CLASS_ACTIONS = "glass-inline-confirm__actions";
const CLASS_BTN_DANGER = "glass-inline-confirm__btn--danger";
const CLASS_BTN_SUCCESS = "glass-inline-confirm__btn--success";
const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_CONFIRM_LABEL = "Confirm";
const DEFAULT_CANCEL_ICON = "x-lg";
const DEFAULT_CONFIRM_ICON = "check-lg";
const VISIBILITY_HIDDEN = "hidden";

const pendingHosts = new WeakMap<Instance, () => void>();

interface InlineConfirmOptions {
    cancelLabel?: string;
    confirmLabel?: string;
    cancelIcon?: string;
    confirmIcon?: string;
    danger?: boolean;
    cancelContext: string;
    confirmContext: string;
    triggerEl?: HTMLElement;
    group?: string;
}

const pendingByGroup = new Map<string, Instance>();

function dismissPriorInGroup(group: string | undefined, currentHost: Instance): void {
    if (group === undefined) return;
    const prior = pendingByGroup.get(group);
    if (prior !== undefined && prior !== currentHost) pendingHosts.get(prior)?.();
    pendingByGroup.set(group, currentHost);
}

function clearGroupOnSettle(group: string | undefined, host: Instance): void {
    if (group === undefined) return;
    if (pendingByGroup.get(group) === host) pendingByGroup.delete(group);
}

function buildCancelBtn(opts: InlineConfirmOptions, settle: (v: boolean) => void): Instance {
    return button(
        {
            variant: BTN_VARIANT_OUTLINE,

            ariaLabel: opts.cancelLabel ?? DEFAULT_CANCEL_LABEL,
            context: opts.cancelContext,
            meta: ["action"],
            onClick: () => settle(false),
        },
        [icon({ name: opts.cancelIcon ?? DEFAULT_CANCEL_ICON, context: null, meta: null })],
    );
}

function buildConfirmBtn(opts: InlineConfirmOptions, danger: boolean, settle: (v: boolean) => void): Instance {
    return button(
        {
            classes: [danger ? CLASS_BTN_DANGER : CLASS_BTN_SUCCESS],
            variant: BTN_VARIANT_OUTLINE,

            ariaLabel: opts.confirmLabel ?? DEFAULT_CONFIRM_LABEL,
            context: opts.confirmContext,
            meta: danger ? ["destructive"] : ["submit"],
            onClick: () => settle(true),
        },
        [icon({ name: opts.confirmIcon ?? DEFAULT_CONFIRM_ICON, context: null, meta: null })],
    );
}

function buildActions(
    opts: InlineConfirmOptions,
    settle: (v: boolean) => void,
): { actions: Instance; confirmBtn: Instance } {
    const danger = Boolean(opts.danger);
    const cancelBtn = buildCancelBtn(opts, settle);
    const confirmBtn = buildConfirmBtn(opts, danger, settle);
    const actions = div({ classes: [CLASS_ACTIONS], context: null, meta: null }, [cancelBtn, confirmBtn]);
    return { actions, confirmBtn };
}

function inlineConfirm(host: Instance, opts: InlineConfirmOptions): Promise<boolean> {
    dismissPriorInGroup(opts.group, host);
    pendingHosts.get(host)?.();
    return new Promise<boolean>((resolve) => {
        const wrappedResolve = (v: boolean): void => {
            clearGroupOnSettle(opts.group, host);
            resolve(v);
        };
        const ta = triggerAnchor(host, opts.triggerEl);
        if (ta === null) {
            wrappedResolve(false);
            return;
        }
        const { trigger, anchor } = ta;
        const prevVisibility = trigger.style.visibility;
        trigger.style.visibility = VISIBILITY_HIDDEN;
        host.el.classList.add(CLASS_PENDING);
        const { settle, bindActions } = startOverlay(
            { host, trigger, anchor, prevVisibility, resolve: wrappedResolve },
            pendingHosts,
        );
        pendingHosts.set(host, () => settle(false));
        const { actions, confirmBtn } = buildActions(opts, settle);
        bindActions(actions);
        anchor.appendChild(actions.el);
        positionOverlay(actions.el, trigger, anchor);
        confirmBtn.el.focus();
    });
}

export { inlineConfirm, INLINE_CONFIRM_HOST_CLASS };
export type { InlineConfirmOptions };
