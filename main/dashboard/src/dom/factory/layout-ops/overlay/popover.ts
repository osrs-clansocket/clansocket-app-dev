import { div } from "../structural/container.js";
import { applyEffects } from "../../effects/effect-applier.js";
import type { ContextProps, Instance } from "../../core/index.js";

const EVT_CLICK = "click";
const EVT_KEYDOWN = "keydown";
const KEY_ESCAPE = "Escape";
const ATTR_EXPANDED = "aria-expanded";

interface PopoverProps extends ContextProps {
    openClass: string;
    rootClasses?: readonly string[];
    rootAttrs?: Record<string, string>;
    onOpen?: () => void;
    onClose?: () => void;
}

interface PopoverInstance extends Instance {
    open(): void;
    close(): void;
    toggle(): void;
    isOpen(): boolean;
    readonly triggerEl: HTMLElement;
    readonly popupEl: HTMLElement;
}

const openPopovers = new Set<PopoverInstance>();
let globalWired = false;

function closeAll(): void {
    for (const p of [...openPopovers]) p.close();
}

function ensureGlobalListeners(): void {
    if (globalWired) return;
    globalWired = true;
    document.addEventListener(EVT_CLICK, () => closeAll());
    document.addEventListener(EVT_KEYDOWN, (e) => {
        if (e.key === KEY_ESCAPE) closeAll();
    });
}

interface OpsCtx {
    props: PopoverProps;
    root: ReturnType<typeof div>;
    popup: Instance;
    trigger: Instance;
    openedRef: { v: boolean };
    getInst: () => PopoverInstance;
}

function popoverOpen(ctx: OpsCtx): void {
    if (ctx.openedRef.v) return;
    closeAll();
    ctx.openedRef.v = true;
    ctx.root.el.classList.add(ctx.props.openClass);
    applyEffects(ctx.popup.el, { name: "drop", once: true });
    ctx.trigger.el.setAttribute(ATTR_EXPANDED, "true");
    openPopovers.add(ctx.getInst());
    ctx.props.onOpen?.();
}

function popoverClose(ctx: OpsCtx): void {
    if (!ctx.openedRef.v) return;
    ctx.openedRef.v = false;
    ctx.root.el.classList.remove(ctx.props.openClass);
    ctx.trigger.el.setAttribute(ATTR_EXPANDED, "false");
    openPopovers.delete(ctx.getInst());
    ctx.props.onClose?.();
}

function makePopoverOps(ctx: OpsCtx): Pick<PopoverInstance, "open" | "close" | "toggle"> {
    return {
        open: () => popoverOpen(ctx),
        close: () => popoverClose(ctx),
        toggle: () => {
            const i = ctx.getInst();
            if (ctx.openedRef.v) i.close();
            else i.open();
        },
    };
}

function popover(props: PopoverProps, trigger: Instance, popup: Instance): PopoverInstance {
    ensureGlobalListeners();
    const root = div(
        { classes: props.rootClasses ?? [], attrs: props.rootAttrs, context: props.context, meta: props.meta },
        [trigger, popup],
    );
    const openedRef = { v: false };
    trigger.el.setAttribute(ATTR_EXPANDED, "false");
    const inst: PopoverInstance = Object.assign(root, {
        triggerEl: trigger.el,
        popupEl: popup.el,
        isOpen: () => openedRef.v,
        ...makePopoverOps({ props, root, popup, trigger, openedRef, getInst: () => inst }),
    });
    trigger.el.addEventListener(EVT_CLICK, (e) => {
        e.stopPropagation();
        inst.toggle();
    });
    popup.el.addEventListener(EVT_CLICK, (e) => e.stopPropagation());
    return inst;
}

export { popover };
export type { PopoverProps, PopoverInstance };
