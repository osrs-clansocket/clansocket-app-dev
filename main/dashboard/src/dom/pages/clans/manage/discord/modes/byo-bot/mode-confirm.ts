import {
    BTN_VARIANT_BARE,
    button,
    div,
    paragraph,
    slidePanel,
    type Instance,
    type SlidePanelInstance,
    baseProps,
    textProps,
} from "../../../../../../factory";
import { DISCORD_PLACEHOLDER_HINT_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { CANCEL_BTN } from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import {
    FOOTER_HOST_CLASS,
    TOOLBAR_BTN_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-classes.js";

export interface ConfirmOpts {
    triggerLabel: string;
    triggerContext: string;
    message: string;
    confirmLabel: string;
    confirmContext: string;
    cancelContext: string;
    onConfirm: () => Promise<void>;
    onPanelOpen?: (inst: SlidePanelInstance) => void;
    onPanelClose?: () => void;
}

function buildConfirmPair(
    opts: ConfirmOpts,
    panelRef: { inst: SlidePanelInstance | null },
): { cancelBtn: Instance; confirmBtn: Instance } {
    const cancelBtn = button({
        classes: [TOOLBAR_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: CANCEL_BTN,
        context: opts.cancelContext,
        meta: ["action"],
        onClick: () => panelRef.inst?.close(),
    });
    const confirmBtn = button({
        classes: [TOOLBAR_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: opts.confirmLabel,
        context: opts.confirmContext,
        meta: ["submit"],
        onClick: () => {
            panelRef.inst?.close();
            void opts.onConfirm().catch(() => undefined);
        },
    });
    return { cancelBtn, confirmBtn };
}

function buildConfirmTrigger(opts: ConfirmOpts): Instance {
    return button({
        classes: [TOOLBAR_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: opts.triggerLabel,
        context: opts.triggerContext,
        meta: ["action"],
    });
}

export function confirmPanel(opts: ConfirmOpts): SlidePanelInstance {
    const panelHost = div(baseProps([]), [paragraph(textProps([DISCORD_PLACEHOLDER_HINT_CLASS], opts.message))]);
    const footerHost = div(baseProps([FOOTER_HOST_CLASS]));
    footerHost.el.hidden = true;
    const panelRef: { inst: SlidePanelInstance | null } = { inst: null };
    const renderFooter = (): void => {
        const { cancelBtn, confirmBtn } = buildConfirmPair(opts, panelRef);
        footerHost.setChildren(confirmBtn, cancelBtn);
        footerHost.el.hidden = false;
    };
    const onOpen = (): void => {
        renderFooter();
        if (panelRef.inst !== null) opts.onPanelOpen?.(panelRef.inst);
    };
    const onClose = (): void => {
        footerHost.clear();
        footerHost.el.hidden = true;
        opts.onPanelClose?.();
    };
    panelRef.inst = slidePanel({ onOpen, onClose, context: null, meta: null }, buildConfirmTrigger(opts), panelHost);
    panelRef.inst.addChild(footerHost);
    return panelRef.inst;
}
