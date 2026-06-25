import { div, paragraph, type Instance } from "../../../../factory";
import { effect, type ReadSignal } from "../../../../factory/reactive/index.js";
import type { WomGroupDetails, WomLinkedStatus, WomStatus } from "../../../../../state/wom/clients/wom-client.js";
import { brandHead, FEEDBACK_CLASS, FUSED_CLASS, HINT_CLASS, ROOT_CLASS } from "./index-constants.js";
import { identityPanel } from "./index-identity.js";
import { membersPanel } from "./index-members.js";
import { statusPanel } from "./index-status.js";
import { buildActionsRow } from "./index-actions.js";

export interface LinkedShellHandle {
    instance: Instance;
    dispose: () => void;
}

export interface LinkedShellConfig {
    slug: string;
    status: WomLinkedStatus;
    currentUserId: string;
    refresh: () => void;
    onRelink: () => void;
    statusSignal: () => WomStatus;
    detailsSignal: ReadSignal<WomGroupDetails | null>;
    feedbackSignal: ReadSignal<string>;
    setFeedback: (msg: string) => void;
}

function pushMutatorRow(fusedChildren: Instance[], disposers: Array<() => void>, cfg: LinkedShellConfig): void {
    fusedChildren.push(
        buildActionsRow({ slug: cfg.slug, refresh: cfg.refresh, onRelink: cfg.onRelink, setFeedback: cfg.setFeedback }),
    );
    const feedbackEl = paragraph({ classes: [FEEDBACK_CLASS], text: "", context: null, meta: null });
    feedbackEl.el.hidden = true;
    fusedChildren.push(feedbackEl);
    const feedbackDisp = effect(() => {
        const msg = cfg.feedbackSignal();
        feedbackEl.setText(msg);
        feedbackEl.el.hidden = msg.length === 0;
    });
    disposers.push(() => feedbackDisp.dispose());
}

function buildLinkedSections(
    cfg: LinkedShellConfig,
    canMutate: boolean,
    fusedChildren: Instance[],
    statusInst: Instance,
): Instance[] {
    const sections: Instance[] = [
        brandHead(),
        div({ classes: [FUSED_CLASS], context: null, meta: null }, fusedChildren),
        statusInst,
    ];
    if (!canMutate) {
        sections.push(
            paragraph({
                classes: [HINT_CLASS],
                text: `Linked by ${cfg.status.linker_site_account_id}. Only they (or the clan owner) can re-link or revoke.`,
                context: null,
                meta: null,
            }),
        );
    }
    return sections;
}

export function buildLinkedShell(cfg: LinkedShellConfig): LinkedShellHandle {
    const canMutate = cfg.status.linker_site_account_id === cfg.currentUserId;
    const identityHandle = identityPanel(cfg.status, cfg.detailsSignal);
    const membersHandle = membersPanel(cfg.slug, cfg.detailsSignal);
    const statusHandle = statusPanel(cfg.statusSignal);
    const fusedChildren: Instance[] = [identityHandle.instance];
    const disposers: Array<() => void> = [identityHandle.dispose, membersHandle.dispose, statusHandle.dispose];
    if (canMutate) pushMutatorRow(fusedChildren, disposers, cfg);
    fusedChildren.push(membersHandle.instance);
    const sections = buildLinkedSections(cfg, canMutate, fusedChildren, statusHandle.instance);
    return {
        instance: div({ classes: [ROOT_CLASS], context: null, meta: null }, sections),
        dispose: () => {
            for (const d of disposers) d();
        },
    };
}
