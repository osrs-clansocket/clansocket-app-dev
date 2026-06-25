import { anchor, div, heading, paragraph, span, type Instance } from "../../../../factory";
import { effect, type ReadSignal } from "../../../../factory/reactive/index.js";
import type { WomGroupDetails, WomLinkedStatus } from "../../../../../state/wom/clients/wom-client.js";
import {
    EXTERNAL_LINK_CLASS,
    IDENTITY_DESC_CLASS,
    IDENTITY_NAME_CLASS,
    isoToDate,
    makeChip,
    META_ROW_CLASS,
    NONE_VALUE,
    OPEN_WOM_BTN,
    SECTION_CLASS,
    VERIFIED_CHIP_CLASS,
    WOM_GROUP_URL_BASE,
    type ChipRefs,
} from "./index-constants.js";

export interface IdentityHandle {
    instance: Instance;
    dispose: () => void;
}

function applyDescription(descEl: Instance, desc: string | null): void {
    const hasText = typeof desc === "string" && desc.length > 0;
    descEl.setText(hasText ? desc : "");
    descEl.el.hidden = !hasText;
}

interface IdentityChipPool {
    groupId: ChipRefs;
    clanChat: ChipRefs;
    members: ChipRefs;
    score: ChipRefs;
    homeworld: ChipRefs;
    created: ChipRefs;
    verified: Instance;
    children: Instance[];
}

function makeChipPool(): IdentityChipPool {
    const chips = {
        groupId: makeChip("Group ID"),
        clanChat: makeChip("Clan chat"),
        members: makeChip("Members"),
        score: makeChip("Score"),
        homeworld: makeChip("Homeworld"),
        created: makeChip("Created"),
    };
    const verified = span({ classes: [VERIFIED_CHIP_CLASS], text: "Verified", context: null, meta: null });
    return {
        ...chips,
        verified,
        children: [
            chips.groupId.instance,
            chips.clanChat.instance,
            chips.members.instance,
            chips.score.instance,
            chips.homeworld.instance,
            chips.created.instance,
            verified,
        ],
    };
}

function applyIdentityChips(pool: IdentityChipPool, details: WomGroupDetails | null, status: WomLinkedStatus): void {
    if (details === null) {
        pool.groupId.valueSpan.setText(String(status.wom_group_id));
        pool.groupId.instance.el.hidden = false;
        pool.clanChat.instance.el.hidden = true;
        pool.members.instance.el.hidden = true;
        pool.score.instance.el.hidden = true;
        pool.homeworld.instance.el.hidden = true;
        pool.created.instance.el.hidden = true;
        pool.verified.el.hidden = true;
        return;
    }
    pool.groupId.instance.el.hidden = true;
    pool.clanChat.valueSpan.setText(details.clanChat);
    pool.clanChat.instance.el.hidden = false;
    pool.members.valueSpan.setText(String(details.memberCount));
    pool.members.instance.el.hidden = false;
    pool.score.valueSpan.setText(String(details.score));
    pool.score.instance.el.hidden = false;
    pool.homeworld.valueSpan.setText(details.homeworld !== null ? String(details.homeworld) : NONE_VALUE);
    pool.homeworld.instance.el.hidden = false;
    pool.created.valueSpan.setText(isoToDate(details.createdAt));
    pool.created.instance.el.hidden = false;
    pool.verified.el.hidden = !details.verified;
}

function identityWomLink(status: WomLinkedStatus): Instance {
    return anchor({
        href: `${WOM_GROUP_URL_BASE}${status.wom_group_id}`,
        text: OPEN_WOM_BTN,
        target: "_blank",
        rel: "noopener noreferrer",
        classes: [EXTERNAL_LINK_CLASS],
        context: "open this WoM group page in a new tab",
        meta: ["nav"],
    });
}

function buildIdentityElements(status: WomLinkedStatus): {
    nameEl: Instance;
    descEl: Instance;
    chipPool: ReturnType<typeof makeChipPool>;
    panel: Instance;
} {
    const nameEl = heading("h3", {
        classes: [IDENTITY_NAME_CLASS],
        text: status.cached_group_name,
        context: null,
        meta: null,
    });
    const descEl = paragraph({ classes: [IDENTITY_DESC_CLASS], text: "", context: null, meta: null });
    descEl.el.hidden = true;
    const chipPool = makeChipPool();
    const metaRow = div({ classes: [META_ROW_CLASS], context: null, meta: null }, chipPool.children);
    const panel = div({ classes: [SECTION_CLASS], context: null, meta: null }, [
        nameEl,
        descEl,
        metaRow,
        identityWomLink(status),
    ]);
    return { nameEl, descEl, chipPool, panel };
}

export function identityPanel(
    status: WomLinkedStatus,
    detailsSignal: ReadSignal<WomGroupDetails | null>,
): IdentityHandle {
    const { nameEl, descEl, chipPool, panel } = buildIdentityElements(status);
    const disp = effect(() => {
        const details = detailsSignal();
        nameEl.setText(details?.name ?? status.cached_group_name);
        applyDescription(descEl, details?.description ?? null);
        applyIdentityChips(chipPool, details, status);
    });
    return { instance: panel, dispose: () => disp.dispose() };
}
