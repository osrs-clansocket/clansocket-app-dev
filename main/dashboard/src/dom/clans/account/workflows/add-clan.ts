import { BTN_VARIANT_PRIMARY, button, div, effect, signal, type Instance } from "../../../factory";
import { consentsStore } from "../../../../state/identity/stores/consents-store.js";
import type { ConsentRecord } from "../../../../state/identity/consent/consent-client.js";
import { identityClient } from "../../../../state/identity/identity-client/index.js";
import { timeStore } from "../../../../state/stores/time-store";
import { buildClaimBanner, effectiveStatus, recordToActive, type ActiveClaim } from "./claim-banner";
import { buildClaimForm } from "./claim-form";
import { ACCOUNT_ADD_CLAN_CLASS } from "../../../../shared/constants/account-constants.js";

function latestPending(rows: readonly ConsentRecord[]): ConsentRecord | null {
    let latest: ConsentRecord | null = null;
    for (const r of rows) {
        if (r.kind !== "claim" || r.status !== "pending") continue;
        if (!latest || r.createdAt > latest.createdAt) latest = r;
    }
    return latest;
}

function findById(rows: readonly ConsentRecord[], id: number): ConsentRecord | null {
    for (const r of rows) {
        if (r.id === id) return r;
    }
    return null;
}

interface AddClanCtx {
    activeClaim: ReturnType<typeof signal<ActiveClaim | null>>;
    lastResolvedIdRef: { v: number | null };
    onClaimed: () => void;
}

async function syncFromServer(ctx: AddClanCtx): Promise<void> {
    await consentsStore.refresh();
    const rows = consentsStore.list$();
    const current = ctx.activeClaim();
    if (current === null) {
        const latest = latestPending(rows);
        if (latest) ctx.activeClaim.set(recordToActive(latest));
        return;
    }
    const match = findById(rows, current.id);
    if (!match) return;
    const next = recordToActive(match);
    ctx.activeClaim.set(next);
    if (next.status === "confirmed" && ctx.lastResolvedIdRef.v !== next.id) {
        ctx.lastResolvedIdRef.v = next.id;
        ctx.onClaimed();
    }
}

function bindGate(
    container: Instance,
    ctx: AddClanCtx,
    openBtn: Instance<HTMLButtonElement>,
    claimForm: ReturnType<typeof buildClaimForm>,
): void {
    container.trackDispose(
        effect(() => {
            const c = ctx.activeClaim();
            const blocked = c !== null && effectiveStatus(c, timeStore.now$()) === "pending";
            if (blocked) {
                openBtn.el.hidden = true;
                claimForm.hide();
            } else if (claimForm.el.hidden) {
                openBtn.el.hidden = false;
            }
        }),
    );
}

function buildOpenBtn(onShow: () => void): Instance<HTMLButtonElement> {
    const openBtn: Instance<HTMLButtonElement> = button({
        variant: BTN_VARIANT_PRIMARY,
        compact: true,
        text: "Claim a clan",
        context: "open the claim-a-clan form",
        meta: ["action", "clan"],
        onClick: () => {
            openBtn.el.hidden = true;
            onShow();
        },
    });
    return openBtn;
}

function makeClaimHandlers(
    ctx: AddClanCtx,
    openBtn: Instance<HTMLButtonElement>,
    claimFormRef: { f: ReturnType<typeof buildClaimForm> | null },
): Parameters<typeof buildClaimForm>[0] {
    return {
        onSuccess: (claim) => {
            claimFormRef.f!.hide();
            ctx.activeClaim.set(claim);
            ctx.onClaimed();
        },
        onCancel: () => {
            claimFormRef.f!.hide();
            openBtn.el.hidden = false;
        },
    };
}

export function buildAddClan(onClaimed: () => void): Instance {
    const ctx: AddClanCtx = {
        activeClaim: signal<ActiveClaim | null>(null),
        lastResolvedIdRef: { v: null },
        onClaimed,
    };
    const claimFormRef: { f: ReturnType<typeof buildClaimForm> | null } = { f: null };
    const openBtn = buildOpenBtn(() => claimFormRef.f!.show());
    const claimForm = buildClaimForm(makeClaimHandlers(ctx, openBtn, claimFormRef));
    claimFormRef.f = claimForm;
    const container = div({ classes: [ACCOUNT_ADD_CLAN_CLASS], context: null, meta: null }, [
        buildClaimBanner(ctx.activeClaim),
        openBtn,
        claimForm.el,
    ]);
    bindGate(container, ctx, openBtn, claimForm);
    container.trackDispose({ dispose: identityClient.openIdentificationStream(() => void syncFromServer(ctx)) });
    void syncFromServer(ctx);
    return container;
}
