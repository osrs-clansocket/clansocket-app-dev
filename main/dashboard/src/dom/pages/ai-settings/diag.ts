import { BTN_VARIANT_OUTLINE, button, div, effect, paragraph, span, type Instance, baseProps, textProps } from "../../factory";
import { personaStore, SLOT_BY_KEY, type SlotMeta } from "../../../ai/persona-store/index.js";
import { modesStore } from "../../../ai/modes-store/index.js";
import { recentEdits$, recordEdit, type EditEntry } from "../../../state/ai-settings/edit-log.js";
import { CONCERNS, type ConcernKey } from "./state.js";

function modesOverrideCount(): number {
    return Object.keys(modesStore.overrides$()).length;
}

function personaSlotOverrideCount(predicate: (s: SlotMeta) => boolean): number {
    const overrides = personaStore.overrides$();
    let count = 0;
    for (const key of Object.keys(overrides)) {
        const meta = SLOT_BY_KEY.get(key);
        if (meta && predicate(meta)) count += 1;
    }
    return count;
}

function concernOverrideCount(key: ConcernKey): number {
    if (key === "modes") return modesOverrideCount();
    if (key === "memory" || key === "profile") return 0;
    if (key === "persona") return personaSlotOverrideCount((s) => s.tier === "identity");
    if (key === "operation") return personaSlotOverrideCount((s) => s.tier === "policy");
    return personaSlotOverrideCount((s) => s.tier === "engagement" || s.tier === "domain");
}

const DIAG_CLASS = "ai-settings__diag";
const SECTION_CLASS = "ai-settings__diag-section";
const HEADING_CLASS = "ai-settings__diag-heading";
const EMPTY_CLASS = "ai-settings__diag-empty";
const ENTRY_CLASS = "ai-settings__diag-entry";
const ENTRY_KEY_CLASS = "ai-settings__diag-entry-key";
const ENTRY_DIFF_CLASS = "ai-settings__diag-entry-diff";
const ENTRY_FROM_CLASS = "ai-settings__diag-entry-from";
const ENTRY_TO_CLASS = "ai-settings__diag-entry-to";
const ENTRY_TIME_CLASS = "ai-settings__diag-entry-time";
const SUMMARY_ROW_CLASS = "ai-settings__diag-summary-row";
const SUMMARY_LABEL_CLASS = "ai-settings__diag-summary-label";
const SUMMARY_VALUE_CLASS = "ai-settings__diag-summary-value";
const ACTIONS_CLASS = "ai-settings__diag-actions";
const ACTION_DESTRUCTIVE_CLASS = "ai-settings__diag-action--destructive";

function buildSection(title: string, body: Instance): Instance {
    return div(baseProps([SECTION_CLASS]), [span(textProps([HEADING_CLASS], title)), body]);
}

function emptyMessage(text: string): Instance {
    return paragraph(textProps([EMPTY_CLASS], text));
}

function relativeTime(ts: number, now: number): string {
    const secs = Math.max(0, Math.floor((now - ts) / 1000));
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
}

function entryNode(entry: EditEntry): Instance {
    const keyEl = span(textProps([ENTRY_KEY_CLASS], entry.key));
    const fromEl = span(textProps([ENTRY_FROM_CLASS], entry.from ?? "default"));
    const toEl = span(textProps([ENTRY_TO_CLASS], entry.to ?? "default"));
    const diffEl = div(baseProps([ENTRY_DIFF_CLASS]), [fromEl, span(textProps([], " -> ")), toEl]);
    const timeEl = span(textProps([ENTRY_TIME_CLASS], relativeTime(entry.ts, Date.now())));
    return div(baseProps([ENTRY_CLASS]), [keyEl, diffEl, timeEl]);
}

function editsView(): Instance {
    const list = div({ context: null, meta: null });
    list.trackDispose(
        effect(() => {
            const entries = recentEdits$();
            list.setChildren();
            if (entries.length === 0) {
                list.addChild(emptyMessage("No recent edits."));
                return;
            }
            for (const e of entries) list.addChild(entryNode(e));
        }),
    );
    return list;
}

function overridesSummaryView(): Instance {
    const wrap = div({ context: null, meta: null });
    const rebuild = (): void => {
        wrap.setChildren();
        let total = 0;
        for (const def of CONCERNS) {
            const count = concernOverrideCount(def.key);
            total += count;
            if (count > 0) wrap.addChild(rowStatic(def.label, count));
        }
        if (total === 0) wrap.addChild(emptyMessage("No overrides yet."));
    };
    wrap.trackDispose(
        effect(() => {
            personaStore.overrides$();
            modesStore.overrides$();
            rebuild();
        }),
    );
    return wrap;
}

function rowStatic(label: string, count: number): Instance {
    return div(baseProps([SUMMARY_ROW_CLASS]), [
        span(textProps([SUMMARY_LABEL_CLASS], label)),
        span(textProps([SUMMARY_VALUE_CLASS], String(count))),
    ]);
}

function diffSnapshots(
    prev: Readonly<Record<string, string | boolean>>,
    curr: Readonly<Record<string, string | boolean>>,
    kind: "slot" | "mode",
): void {
    const ts = Date.now();
    for (const k of Object.keys(curr)) {
        if (prev[k] !== curr[k]) {
            recordEdit({ kind, key: k, from: stringifyVal(prev[k]), to: stringifyVal(curr[k]), ts });
        }
    }
    for (const k of Object.keys(prev)) {
        if (!(k in curr)) recordEdit({ kind, key: k, from: stringifyVal(prev[k]), to: undefined, ts });
    }
}

function stringifyVal(v: string | boolean | undefined): string | undefined {
    if (v === undefined) return undefined;
    return String(v);
}

function bindDiff(diag: Instance): void {
    let prevPersona: Readonly<Record<string, string>> = personaStore.overrides$();
    let prevModes: Readonly<Record<string, boolean>> = modesStore.overrides$();
    diag.trackDispose(
        effect(() => {
            const curr = personaStore.overrides$();
            if (curr !== prevPersona) {
                diffSnapshots(prevPersona, curr, "slot");
                prevPersona = curr;
            }
        }),
    );
    diag.trackDispose(
        effect(() => {
            const curr = modesStore.overrides$();
            if (curr !== prevModes) {
                diffSnapshots(prevModes, curr, "mode");
                prevModes = curr;
            }
        }),
    );
}

function resetAllOverrides(): void {
    personaStore.clear();
    modesStore.resetAll();
}

function actionBtn(label: string, contextText: string, onClick: () => void, destructive = false): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,
        classes: destructive ? [ACTION_DESTRUCTIVE_CLASS] : [],
        text: label,
        ariaLabel: label,
        context: contextText,
        meta: [destructive ? "destructive" : "action"],
        onClick,
    });
}

function buildActions(): Instance {
    return div(baseProps([ACTIONS_CLASS]), [
        actionBtn("Show diffs", "show every override vs default", () => undefined),
        actionBtn("Export", "download current overrides as JSON", () => undefined),
        actionBtn("Reset all", "reset every persona slot and mode toggle to defaults", resetAllOverrides, true),
    ]);
}

export function buildDiag(): Instance {
    const diag = div(baseProps([DIAG_CLASS]), [
        buildSection("Override summary", overridesSummaryView()),
        buildSection("Latest edits", editsView()),
        buildActions(),
    ]);
    bindDiff(diag);
    return diag;
}
