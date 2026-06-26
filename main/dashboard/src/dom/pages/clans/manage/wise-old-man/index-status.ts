import { div, heading, span, type Instance, baseProps, textProps } from "../../../../factory";
import { effect } from "../../../../factory/reactive/index.js";
import { rsnTag } from "../../../../factory/data-ops/identity/rsn-tag.js";
import type { WomLinkedStatus, WomStatus } from "../../../../../state/wom/clients/wom-client.js";
import {
    INTERNAL_GRID_CLASS,
    INTERNAL_LABEL_CLASS,
    INTERNAL_ROW_CLASS,
    INTERNAL_VALUE_CLASS,
    LINKER_VALUE_CLASS,
    msToDate,
    NONE_VALUE,
    SECTION_CLASS,
    SECTION_TITLE_CLASS,
} from "./index-constants.js";

export interface StatusHandle {
    instance: Instance;
    dispose: () => void;
}

interface StatusPanelRefs {
    linkerHost: Instance;
    lastVerifiedText: Instance;
    lastBackfillText: Instance;
}

function makeRenderLinker(linkerHost: Instance): (status: Extract<WomStatus, { linked: true }>) => void {
    return (status) => {
        if (status.linker_rsn !== null && status.linker_rsn.length > 0) {
            linkerHost.setChildren(
                rsnTag({ rsn: status.linker_rsn, rank: status.linker_rank, size: "sm", context: null, meta: null }),
            );
        } else {
            linkerHost.setChildren(span(textProps([LINKER_VALUE_CLASS], status.linker_site_account_id)));
        }
    };
}

function applyUnlinkedStatus(refs: StatusPanelRefs): void {
    refs.linkerHost.setChildren(span(textProps([LINKER_VALUE_CLASS], NONE_VALUE)));
    refs.lastVerifiedText.setText(NONE_VALUE);
    refs.lastBackfillText.setText(NONE_VALUE);
}

function makeStatusEffect(
    statusSignal: () => WomStatus,
    refs: StatusPanelRefs,
    renderLinker: (s: Extract<WomStatus, { linked: true }>) => void,
): () => void {
    let renderedLinkerKey = "";
    return () => {
        const status = statusSignal();
        if (!status.linked) {
            applyUnlinkedStatus(refs);
            renderedLinkerKey = "";
            return;
        }
        const linkerKey = `${status.linker_rsn ?? ""}|${status.linker_rank ?? ""}|${status.linker_site_account_id}`;
        if (linkerKey !== renderedLinkerKey) {
            renderedLinkerKey = linkerKey;
            renderLinker(status);
        }
        refs.lastVerifiedText.setText(msToDate(status.last_verified_at));
        refs.lastBackfillText.setText(msToDate(status.last_backfill_at));
    };
}

export function statusPanel(statusSignal: () => WomStatus): StatusHandle {
    const internalRow = (label: string, valueInst: Instance): Instance =>
        div(baseProps([INTERNAL_ROW_CLASS]), [span(textProps([INTERNAL_LABEL_CLASS], label)), valueInst]);
    const refs: StatusPanelRefs = {
        linkerHost: div(baseProps([INTERNAL_VALUE_CLASS])),
        lastVerifiedText: span(textProps([INTERNAL_VALUE_CLASS], NONE_VALUE)),
        lastBackfillText: span(textProps([INTERNAL_VALUE_CLASS], NONE_VALUE)),
    };
    const grid = div(baseProps([INTERNAL_GRID_CLASS]), [
        internalRow("Linked by", refs.linkerHost),
        internalRow("Last verified", refs.lastVerifiedText),
        internalRow("Last backfill", refs.lastBackfillText),
    ]);
    const section = div(baseProps([SECTION_CLASS]), [
        heading("h3", { classes: [SECTION_TITLE_CLASS], text: "ClanSocket status", context: null, meta: null }),
        grid,
    ]);
    const disp = effect(makeStatusEffect(statusSignal, refs, makeRenderLinker(refs.linkerHost)));
    return { instance: section, dispose: () => disp.dispose() };
}

export type { WomLinkedStatus };
