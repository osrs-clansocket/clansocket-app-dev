import {
    createLiveStore,
    div,
    heading,
    liveView,
    paragraph,
    span,
    type Instance,
    type LiveSource,
    type LiveViewHandle,
    baseProps,
    textProps,
} from "../../../../factory";
import { rsnTag } from "../../../../factory/data-ops/identity/rsn-tag.js";
import { effect, type ReadSignal } from "../../../../factory/reactive/index.js";
import type { WomGroupDetails, WomGroupMembership } from "../../../../../state/wom/clients/wom-client.js";
import {
    DETAILS_LOADING_TEXT,
    HINT_CLASS,
    isoToDate,
    MEMBER_META_CLASS,
    MEMBER_NAME_CLASS,
    MEMBER_ROLE_CLASS,
    MEMBER_ROW_CLASS,
    MEMBERS_TABLE_CLASS,
    NONE_VALUE,
    SECTION_CLASS,
    SECTION_TITLE_CLASS,
} from "./index-constants.js";

interface MemberTileRefs {
    roleText: Instance;
    metaText: Instance;
}

const memberRefs = new WeakMap<Instance, MemberTileRefs>();

function mountMemberRow(row: Record<string, unknown>): Instance {
    const m = row as unknown as WomGroupMembership;
    const role = m.role;
    const roleText = span(textProps([MEMBER_ROLE_CLASS], role ?? NONE_VALUE));
    const rsnTagInst = rsnTag({
        rsn: m.player.displayName,
        rank: role,
        size: "sm",
        classes: [MEMBER_NAME_CLASS],
        context: null,
        meta: null,
    });
    const metaText = span(textProps([MEMBER_META_CLASS], isoToDate(m.player.updatedAt)));
    const tile = div(baseProps([MEMBER_ROW_CLASS]), [roleText, rsnTagInst, metaText]);
    memberRefs.set(tile, { roleText, metaText });
    return tile;
}

function patchMemberRow(inst: Instance, row: Record<string, unknown>): void {
    const m = row as unknown as WomGroupMembership;
    const refs = memberRefs.get(inst);
    if (!refs) return;
    refs.roleText.setText(m.role ?? NONE_VALUE);
    refs.metaText.setText(isoToDate(m.player.updatedAt));
}

function membersSource(slug: string, detailsSignal: ReadSignal<WomGroupDetails | null>): LiveSource {
    return {
        subscribe(onSnapshot): () => void {
            let seq = 0;
            const disp = effect(() => {
                const details = detailsSignal();
                const rows = (details?.memberships ?? []).map((m) => m as unknown as Record<string, unknown>);
                seq += 1;
                onSnapshot({ topic: `wom-members:${slug}`, seq, rows });
            });
            return () => disp.dispose();
        },
    };
}

function buildLiveView(
    slug: string,
    detailsSignal: ReadSignal<WomGroupDetails | null>,
    grid: Instance,
): LiveViewHandle {
    const store = createLiveStore<Record<string, unknown>>({
        topic: `wom-members:${slug}`,
        keyOf: (row) => String((row as unknown as WomGroupMembership).playerId),
        source: membersSource(slug, detailsSignal),
    });
    const view: LiveViewHandle = liveView<Record<string, unknown>>({
        store,
        container: grid,
        mountRow: mountMemberRow,
        patchRow: patchMemberRow,
        rowContentVisibility: "card",
    });
    view.start();
    return view;
}

export interface MembersHandle {
    instance: Instance;
    dispose: () => void;
}

export function membersPanel(slug: string, detailsSignal: ReadSignal<WomGroupDetails | null>): MembersHandle {
    const headingEl = heading("h3", { classes: [SECTION_TITLE_CLASS], text: "Members", context: null, meta: null });
    const loadingEl = paragraph(textProps([HINT_CLASS], DETAILS_LOADING_TEXT));
    const grid = div(baseProps([MEMBERS_TABLE_CLASS]));
    const section = div(baseProps([SECTION_CLASS]), [headingEl, loadingEl, grid]);
    const view = buildLiveView(slug, detailsSignal, grid);
    const loadingDisp = effect(() => {
        loadingEl.el.hidden = detailsSignal() !== null;
    });
    return {
        instance: section,
        dispose: () => {
            view.teardown();
            loadingDisp.dispose();
        },
    };
}
