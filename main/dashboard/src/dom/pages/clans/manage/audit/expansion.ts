import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    snapshot,
    type Instance,
    baseProps,
} from "../../../../factory";
import { clansClient, type ClanAuditEntry } from "../../../../../state/clans/clans-client/index.js";
import { buildDiff, buildDiffList, buildRawPayload } from "./expansion-diff.js";
import {
    AUDIT_EXPANSION_BODY_CLASS,
    AUDIT_REVERT_BTN_CLASS,
    AUDIT_REVERT_CLASS,
} from "../../../../../shared/constants/clan/audit-route-constants.js";

const ACTION_ROSTER_CHANGED = "server:roster.changed";

export const REVERTABLE_ACTIONS: ReadonlySet<string> = new Set<string>([
    "server:branding.updated",
    "server:manager.granted",
    "server:manager.revoked",
    "server:claim.transferred",
    "server:whitelist.added",
]);

export function canRevertEntry(entry: ClanAuditEntry): boolean {
    if (!REVERTABLE_ACTIONS.has(entry.action)) return false;
    if (entry.payload?.revertsAuditId !== undefined) return false;
    return true;
}

interface RevertArgs {
    entry: ClanAuditEntry;
    host: Instance;
    btn: Instance<HTMLButtonElement>;
    slug: string;
    onReverted: () => void;
}

async function attemptRevert(args: RevertArgs): Promise<void> {
    const { entry, host, btn, slug, onReverted } = args;
    const confirmed = await inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Revert",
        danger: true,
        cancelContext: `keep audit entry #${entry.id} as-is`,
        confirmContext: `confirm reverting audit entry #${entry.id} to its prior state`,
    });
    if (!confirmed) return;
    btn.el.disabled = true;
    btn.setText("Reverting…");
    const result = await clansClient.revertEntry(slug, entry.id);
    if (!result.ok) {
        btn.el.disabled = false;
        btn.setText(snapshot(`↺ Revert failed (${result.reason ?? "?"})`));
        return;
    }
    onReverted();
}

function buildRevertSection(entry: ClanAuditEntry, slug: string, onReverted: () => void): Instance {
    const host = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const btn = button({
        variant: BTN_VARIANT_OUTLINE,
        classes: [AUDIT_REVERT_BTN_CLASS],
        text: "↺ Revert this change",
        key: `revert-${entry.id}`,
        ariaLabel: `Revert audit entry #${entry.id}`,
        context: "revert this audit entry to its prior state",
        meta: ["action", "audit"],
        onClick: (e) => {
            e.stopPropagation();
            void attemptRevert({ entry, host, btn, slug, onReverted });
        },
    });
    host.addChild(btn);
    return div(baseProps([AUDIT_REVERT_CLASS]), [host]);
}

export async function loadRevertExpansion(
    entry: ClanAuditEntry,
    slug: string,
    onReverted: () => void,
): Promise<Instance> {
    const children: Instance[] = [];
    if (entry.action === ACTION_ROSTER_CHANGED && entry.targetId !== null) {
        const diffs = await clansClient.listRosterDiffs(slug, entry.targetId);
        children.push(buildDiffList(diffs));
    } else if (entry.payload && (entry.payload.before !== undefined || entry.payload.after !== undefined)) {
        children.push(buildDiff(entry));
    } else {
        children.push(buildRawPayload(entry));
    }
    if (canRevertEntry(entry)) children.push(buildRevertSection(entry, slug, onReverted));
    return div(baseProps([AUDIT_EXPANSION_BODY_CLASS]), children);
}
