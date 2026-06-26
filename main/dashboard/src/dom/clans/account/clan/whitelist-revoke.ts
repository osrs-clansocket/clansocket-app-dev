import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    paragraph,
    slidePanel,
    span,
    type Child,
    type Instance,
    type SlidePanelInstance,
    baseProps,
} from "../../../factory";
import { clansClient } from "../../../../state/clans/clans-client/index.js";
import {
    ACCOUNT_PANEL_TITLE_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
} from "../../../../shared/constants/account-constants.js";

function buildPanelTitle(text: string): Instance {
    return span({ text, classes: [ACCOUNT_PANEL_TITLE_CLASS], context: null, meta: null });
}

function buildPanelMessage(text: string): Instance {
    const inst = paragraph({ text, classes: [ACCOUNT_SECTION_HINT_CLASS], context: null, meta: null });
    inst.el.style.margin = "0";
    return inst;
}

function buildPanelActions(children: Child[]): Instance {
    const inst = div(baseProps([]), children);
    inst.el.style.display = "flex";
    inst.el.style.flexDirection = "column";
    inst.el.style.gap = "var(--sp-2)";
    return inst;
}

interface RevokeArgs {
    rank: string;
    slug: string;
    entryId: string;
    refresh: () => Promise<void>;
    panelRef: { inst: SlidePanelInstance | null };
}

function revokeCancelBtn(a: RevokeArgs): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Cancel",
        context: `keep ${a.rank} whitelisted`,
        meta: ["action"],
        onClick: () => a.panelRef.inst?.close(),
    });
}

function revokeConfirmBtn(a: RevokeArgs): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Revoke",
        context: `confirm revoking ${a.rank} from the whitelist`,
        meta: ["destructive"],
        onClick: async () => {
            a.panelRef.inst?.close();
            await clansClient.revokeWhitelistEntry(a.slug, a.entryId);
            await a.refresh();
        },
    });
}

export interface RevokeBtnArgs {
    triggerBtn: Instance;
    slug: string;
    rank: string;
    entryId: string;
    refresh: () => Promise<void>;
}

export function buildRevokeBtn(args: RevokeBtnArgs): { inst: SlidePanelInstance; btn: Instance } {
    const { triggerBtn, slug, rank, entryId, refresh } = args;
    const panelHost = div(baseProps([]));
    const panelRef: { inst: SlidePanelInstance | null } = { inst: null };
    const renderPanelContent = (): void => {
        panelHost.setChildren(
            buildPanelTitle("Revoke rank whitelist"),
            buildPanelMessage(
                `Remove "${rank}" from the manager-rank whitelist? Plugin sessions with this rank lose manager access until u re-whitelist them or they get approved by existing managers.`,
            ),
            buildPanelActions([
                revokeCancelBtn({ rank, slug, entryId, refresh, panelRef }),
                revokeConfirmBtn({ rank, slug, entryId, refresh, panelRef }),
            ]),
        );
    };
    const inst = slidePanel(
        { onOpen: renderPanelContent, onClose: () => panelHost.clear(), context: null, meta: null },
        triggerBtn,
        panelHost,
    );
    panelRef.inst = inst;
    return { inst, btn: triggerBtn };
}
