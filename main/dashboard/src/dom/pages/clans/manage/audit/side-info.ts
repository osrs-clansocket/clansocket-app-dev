import {
    div,
    slidePanel,
    span,
    type Instance,
    type SlidePanelInstance,
    baseProps,
    textProps,
} from "../../../../factory";
import {
    AUDIT_INTEGRITY_CLASS,
    AUDIT_INTEGRITY_LABEL_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";
import { buildPanelRenderer } from "./side-info-panel.js";
import { runIntegrityRefresh, type IntegrityState } from "./side-info-types.js";

export { buildAnalyticsStrip } from "./side-info-strip.js";
export { emptyStats, updateStats, type AggregateStats } from "../../../../../state/clans/audit/side-info-stats.js";

export function buildIntegrityIndicator(slug: string, list: Instance): Instance {
    const label = span(textProps([AUDIT_INTEGRITY_LABEL_CLASS], "Verifying…"));
    const trigger = div(baseProps([AUDIT_INTEGRITY_CLASS]), [label]);
    const lastRef = { v: { ok: false, breakAtId: null, breakReason: null, rowsChecked: 0 } as IntegrityState };
    const panelHost = div(baseProps([]));
    const panelRef: { inst: SlidePanelInstance | null } = { inst: null };
    const renderPanelContent = buildPanelRenderer(panelHost, panelRef, lastRef, list);
    panelRef.inst = slidePanel(
        {
            onOpen: () => renderPanelContent(),
            onClose: () => panelHost.clear(),
            bannerMode: true,
            context: null,
            meta: null,
        },
        trigger,
        panelHost,
    );
    panelRef.inst.el.style.marginInlineStart = "auto";
    void runIntegrityRefresh(slug, label, trigger, lastRef);
    return panelRef.inst;
}
