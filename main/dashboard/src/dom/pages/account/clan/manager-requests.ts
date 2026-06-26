import {
    BTN_VARIANT_PRIMARY,
    button,
    div,
    effect,
    heading,
    paragraph,
    span,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory";
import { clansClient, type ManagedClan } from "../../../../state/clans/clans-client/index.js";
import { managerRequestsStore, type ManagerRequest } from "../../../../state/clans/stores/manager-requests-store.js";
import { LIST_ROW_CLASS, META_CLASS, ROW_CLASS, SURFACE_ROW_CLASS } from "../shared/row-classes.js";
import {
    ACCOUNT_CLAN_BRANDING_SECTION_CLASS,
    ACCOUNT_LIST_CLASS,
    ACCOUNT_PANEL_TITLE_CLASS,
    ACCOUNT_SECTION_HINT_CLASS,
} from "../../../../shared/constants/account-constants.js";

interface ReconcileCtx {
    clan: ManagedClan;
    container: Instance;
    list: Instance;
    pool: Map<string, Instance>;
    store: ReturnType<typeof managerRequestsStore>;
    refresh: () => Promise<void>;
}

function reconcileRequestRows(ctx: ReconcileCtx): void {
    const requests = ctx.store.requests$();
    ctx.container.el.hidden = requests.length === 0;
    const liveIds = new Set<string>();
    for (const r of requests) {
        liveIds.add(r.id);
        if (!ctx.pool.has(r.id)) ctx.pool.set(r.id, buildRequestRow(ctx.clan.slug, r, ctx.refresh));
    }
    for (const [id, inst] of ctx.pool) {
        if (!liveIds.has(id)) {
            inst.destroy();
            ctx.pool.delete(id);
        }
    }
    let nextEl: ChildNode | null = ctx.list.el.firstChild;
    for (const r of requests) {
        const inst = ctx.pool.get(r.id);
        if (inst === undefined) continue;
        if (inst.el === nextEl) nextEl = nextEl?.nextSibling ?? null;
        else ctx.list.addBefore(inst, nextEl);
    }
}

function buildShell(list: Instance): Instance {
    return div(baseProps([ACCOUNT_CLAN_BRANDING_SECTION_CLASS]), [
        heading("h3", {
            classes: [ACCOUNT_PANEL_TITLE_CLASS],
            text: "Pending manager requests",
            context: null,
            meta: null,
        }),
        paragraph(textProps([ACCOUNT_SECTION_HINT_CLASS], "Out-of-clan + wrong-clan users who want manager access.")),
        list,
    ]);
}

export function managerRequests(clan: ManagedClan): Instance {
    const list = div(baseProps([ACCOUNT_LIST_CLASS]));
    const container = buildShell(list);
    container.el.hidden = true;
    const store = managerRequestsStore(clan.slug);
    const ctx: ReconcileCtx = {
        clan,
        container,
        list,
        store,
        pool: new Map<string, Instance>(),
        refresh: () => store.refresh(),
    };
    container.trackDispose(effect(() => reconcileRequestRows(ctx)));
    return container;
}

function buildRequestActions(slug: string, r: ManagerRequest, refresh: () => Promise<void>): [Instance, Instance] {
    const approve = button({
        variant: BTN_VARIANT_PRIMARY,

        text: "Approve",
        context: "approve this manager request",
        meta: ["action", "clan"],
        onClick: async () => {
            await clansClient.approveManagerRequest(slug, r.id);
            await refresh();
        },
    });
    const deny = button({
        text: "Deny",
        context: "deny this manager request",
        meta: ["destructive", "clan"],
        onClick: async () => {
            await clansClient.denyManagerRequest(slug, r.id);
            await refresh();
        },
    });
    return [approve, deny];
}

function buildRequestRow(slug: string, r: ManagerRequest, refresh: () => Promise<void>): Instance {
    const [approve, deny] = buildRequestActions(slug, r, refresh);
    const verifyLabel = r.pluginVerified ? "✓ plugin-verified" : "⌛ no plugin proof";
    const provider = r.siteAccountProvider ? ` via ${r.siteAccountProvider}` : "";
    const rsnFragment = r.declaredRsn.length > 0 ? ` → rsn:${r.declaredRsn}` : "";
    return div(baseProps([ROW_CLASS, LIST_ROW_CLASS, SURFACE_ROW_CLASS]), [
        span(textProps([META_CLASS], `${r.siteAccountDisplay}${provider}${rsnFragment} • ${verifyLabel}`)),
        approve,
        deny,
    ]);
}
