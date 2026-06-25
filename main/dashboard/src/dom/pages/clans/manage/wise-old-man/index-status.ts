import { div, heading, span, type Instance } from "../../../../factory";
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
            linkerHost.setChildren(
                span({ classes: [LINKER_VALUE_CLASS], text: status.linker_site_account_id, context: null, meta: null }),
            );
        }
    };
}

function applyUnlinkedStatus(refs: StatusPanelRefs): void {
    refs.linkerHost.setChildren(span({ classes: [LINKER_VALUE_CLASS], text: NONE_VALUE, context: null, meta: null }));
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
        div({ classes: [INTERNAL_ROW_CLASS], context: null, meta: null }, [
            span({ classes: [INTERNAL_LABEL_CLASS], text: label, context: null, meta: null }),
            valueInst,
        ]);
    const refs: StatusPanelRefs = {
        linkerHost: div({ classes: [INTERNAL_VALUE_CLASS], context: null, meta: null }),
        lastVerifiedText: span({ classes: [INTERNAL_VALUE_CLASS], text: NONE_VALUE, context: null, meta: null }),
        lastBackfillText: span({ classes: [INTERNAL_VALUE_CLASS], text: NONE_VALUE, context: null, meta: null }),
    };
    const grid = div({ classes: [INTERNAL_GRID_CLASS], context: null, meta: null }, [
        internalRow("Linked by", refs.linkerHost),
        internalRow("Last verified", refs.lastVerifiedText),
        internalRow("Last backfill", refs.lastBackfillText),
    ]);
    const section = div({ classes: [SECTION_CLASS], context: null, meta: null }, [
        heading("h3", { classes: [SECTION_TITLE_CLASS], text: "ClanSocket status", context: null, meta: null }),
        grid,
    ]);
    const disp = effect(makeStatusEffect(statusSignal, refs, makeRenderLinker(refs.linkerHost)));
    return { instance: section, dispose: () => disp.dispose() };
}

export type { WomLinkedStatus };
