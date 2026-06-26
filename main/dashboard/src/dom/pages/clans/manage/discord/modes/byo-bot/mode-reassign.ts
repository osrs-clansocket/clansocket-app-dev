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
import { type ClanManagerRow } from "../../../../../../../state/clans/clans-client/people/index.js";
import { clanManagersStore } from "../../../../../../../state/clans/stores/clan-managers-store.js";
import {
    DISCORD_PANE_PLACEHOLDER_CLASS,
    DISCORD_PLACEHOLDER_HINT_CLASS,
} from "../../../../../../../shared/constants/clan-manage-discord/route-constants.js";
import {
    CANCEL_BTN,
    LOADING_MANAGERS_TEXT,
    REASSIGN_BTN,
    REASSIGN_EMPTY,
    REASSIGN_LEDE,
} from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-text.js";
import { compactBtn } from "./mode-buttons.js";
import { TOOLBAR_BTN_CLASS } from "../../../../../../../shared/constants/clan-manage-discord/byo-bot-classes.js";

export interface ReassignPanelOptions {
    slug: string;
    currentLinkerId: string;
    onSelect: (userId: string, displayName: string) => Promise<void>;
    onPanelOpen: (inst: SlidePanelInstance) => void;
    onPanelClose: () => void;
}

interface ReassignState {
    panelHost: Instance;
    panelInstRef: { v: SlidePanelInstance | null };
    opts: ReassignPanelOptions;
    managersStore: ReturnType<typeof clanManagersStore>;
}

function renderReassignError(state: ReassignState, message: string): void {
    state.panelHost.setChildren(
        paragraph(textProps([DISCORD_PANE_PLACEHOLDER_CLASS], message)),
        compactBtn(CANCEL_BTN, "close the reassign-linker panel after a failure", () => state.panelInstRef.v?.close()),
    );
}

function buildOptionBtn(state: ReassignState, m: ClanManagerRow): Instance {
    return compactBtn(
        `${m.siteAccountDisplay} (${m.role})`,
        `reassign the BYO bot linker to ${m.siteAccountDisplay}`,
        () => {
            void state.opts
                .onSelect(m.siteAccountId, m.siteAccountDisplay)
                .then(() => state.panelInstRef.v?.close())
                .catch((e: unknown) => {
                    renderReassignError(state, `Reassign failed: ${e instanceof Error ? e.message : "unknown error"}`);
                });
        },
    );
}

function renderReassignEligible(state: ReassignState, eligible: ClanManagerRow[]): void {
    if (eligible.length === 0) {
        state.panelHost.setChildren(
            paragraph(textProps([DISCORD_PLACEHOLDER_HINT_CLASS], REASSIGN_EMPTY)),
            compactBtn(CANCEL_BTN, "close the reassign-linker panel", () => state.panelInstRef.v?.close()),
        );
        return;
    }
    state.panelHost.setChildren(
        paragraph(textProps([DISCORD_PLACEHOLDER_HINT_CLASS], REASSIGN_LEDE)),
        ...eligible.map((m) => buildOptionBtn(state, m)),
        compactBtn(CANCEL_BTN, "cancel the reassign-linker action", () => state.panelInstRef.v?.close()),
    );
}

async function renderReassignManagers(state: ReassignState): Promise<void> {
    state.panelHost.setChildren(paragraph(textProps([DISCORD_PLACEHOLDER_HINT_CLASS], LOADING_MANAGERS_TEXT)));
    try {
        await state.managersStore.refresh();
    } catch (e) {
        renderReassignError(state, `Could not load clan managers: ${(e as Error).message}`);
        return;
    }
    const managers: ClanManagerRow[] = state.managersStore.managers$();
    renderReassignEligible(
        state,
        managers.filter((m) => m.siteAccountId !== state.opts.currentLinkerId),
    );
}

function buildReassignTrigger(): Instance<HTMLButtonElement> {
    return button({
        classes: [TOOLBAR_BTN_CLASS],
        variant: BTN_VARIANT_BARE,
        text: REASSIGN_BTN,
        context: "open the reassign-linker picker",
        meta: ["action"],
    });
}

function reassignSlidePanel(state: ReassignState): SlidePanelInstance {
    return slidePanel(
        {
            onOpen: () => {
                void renderReassignManagers(state);
                if (state.panelInstRef.v !== null) state.opts.onPanelOpen(state.panelInstRef.v);
            },
            onClose: () => {
                state.panelHost.clear();
                state.opts.onPanelClose();
            },
            context: null,
            meta: null,
        },
        buildReassignTrigger(),
        state.panelHost,
    );
}

export function buildReassignPanel(opts: ReassignPanelOptions): SlidePanelInstance {
    const state: ReassignState = {
        opts,
        panelHost: div(baseProps([])),
        panelInstRef: { v: null },
        managersStore: clanManagersStore(opts.slug),
    };
    const panelInst = reassignSlidePanel(state);
    state.panelInstRef.v = panelInst;
    return panelInst;
}
