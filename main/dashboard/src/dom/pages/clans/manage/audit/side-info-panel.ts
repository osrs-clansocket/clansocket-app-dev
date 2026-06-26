import {
    applyEffects,
    BTN_VARIANT_BARE,
    BTN_VARIANT_OUTLINE,
    button,
    div,
    icon,
    paragraph,
    span,
    type Instance,
    type SlidePanelInstance,
    baseProps,
    textProps,
} from "../../../../factory";
import {
    AUDIT_PANEL_MESSAGE_CLASS,
    AUDIT_SHOW_ROW_LABEL_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";
import type { IntegrityState } from "./side-info-types.js";

export function buildPanelMessage(text: string): Instance {
    return paragraph({ text, classes: [AUDIT_PANEL_MESSAGE_CLASS], context: null, meta: null });
}

export function buildActionsCluster(children: Instance[]): Instance {
    const inst = div(baseProps([]), children);
    inst.el.style.display = "flex";
    inst.el.style.alignItems = "center";
    inst.el.style.gap = "var(--sp-2)";
    inst.el.style.flexShrink = "0";
    return inst;
}

export function buildPanelRow(message: Instance, actions: Instance): Instance {
    const row = div(baseProps([]), [message, actions]);
    row.el.style.display = "grid";
    row.el.style.gridTemplateColumns = "1fr auto";
    row.el.style.alignItems = "start";
    row.el.style.gap = "var(--sp-2)";
    row.el.style.inlineSize = "100%";
    return row;
}

function wrapPanelBtn(inst: Instance): Instance {
    inst.el.style.gap = "var(--sp-1)";
    inst.el.style.alignItems = "center";
    return inst;
}

export function buildCloseBtn(panelRef: { inst: SlidePanelInstance | null }): Instance {
    const inst = wrapPanelBtn(
        button(
            {
                classes: [],
                variant: BTN_VARIANT_BARE,

                ariaLabel: "Close",
                context: "close the integrity status panel",
                meta: ["action"],
                onClick: () => panelRef.inst?.close(),
            },
            [icon({ name: "x-lg", classes: [], context: null, meta: null })],
        ),
    );
    inst.el.style.color = "var(--base-gold-300)";
    return inst;
}

export function buildShowBtn(breakAt: number, showRow: (n: number) => void): Instance {
    return wrapPanelBtn(
        button(
            {
                classes: [],
                variant: BTN_VARIANT_OUTLINE,

                ariaLabel: "Show broken audit row",
                context: "scroll to and highlight the broken audit entry",
                meta: ["action"],
                onClick: () => showRow(breakAt),
            },
            [
                span(textProps([AUDIT_SHOW_ROW_LABEL_CLASS], "Show row")),
                icon({ name: "chevron-right", classes: [], context: null, meta: null }),
            ],
        ),
    );
}

import { reasonText } from "../../../../../state/clans/audit/side-info-reasons.js";

export function makeShowRow(
    panelHost: Instance,
    panelRef: { inst: SlidePanelInstance | null },
    list: Instance,
): (breakAt: number) => void {
    return (breakAt) => {
        const target = list.el.querySelector<HTMLElement>(`[data-key="audit-${breakAt}"]`);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "center" });
            applyEffects(target, { name: "flash-attention", once: true });
            panelRef.inst?.close();
            return;
        }
        panelHost.setChildren(
            buildPanelRow(
                buildPanelMessage(
                    `Row #${breakAt} isnt in the currently rendered range. Clear filters and click 'Load more' to expand, then try again.`,
                ),
                buildActionsCluster([buildCloseBtn(panelRef)]),
            ),
        );
    };
}

function renderOkPanel(panelHost: Instance, panelRef: { inst: SlidePanelInstance | null }, rowsChecked: number): void {
    panelHost.setChildren(
        buildPanelRow(
            buildPanelMessage(
                `Verified ${rowsChecked} ${rowsChecked === 1 ? "row" : "rows"}. Every entry's hash and chain link match — no row altered or removed since insertion.`,
            ),
            buildActionsCluster([buildCloseBtn(panelRef)]),
        ),
    );
}

export function buildPanelRenderer(
    panelHost: Instance,
    panelRef: { inst: SlidePanelInstance | null },
    lastRef: { v: IntegrityState },
    list: Instance,
): () => void {
    const showRow = makeShowRow(panelHost, panelRef, list);
    return () => {
        const last = lastRef.v;
        if (last.ok) {
            renderOkPanel(panelHost, panelRef, last.rowsChecked);
            return;
        }
        const message = `${reasonText(last.breakReason ?? "unknown")}\n\nIf you didnt manually edit the db, this is a ClanSocket bug — report it. Integrity passed at insert; a break means tamper or a bypassing code path.`;
        const actions: Instance[] = [];
        if (last.breakAtId !== null) actions.push(buildShowBtn(last.breakAtId, showRow));
        actions.push(buildCloseBtn(panelRef));
        panelHost.setChildren(buildPanelRow(buildPanelMessage(message), buildActionsCluster(actions)));
    };
}
