import type { Disposable, Signal } from "../../../../factory/reactive";
import { effect, signal } from "../../../../factory/reactive/index.js";
import type { Instance } from "../../../../factory";
import { postRefresh } from "../../../../../state/clans/runewatch/runewatch-client.js";
import type { RunewatchStore } from "../../../../../state/clans/runewatch/runewatch-store.js";
import { timeStore } from "../../../../../state/stores/time-store.js";

const MS_PER_MINUTE = 60000;
const MS_PER_SECOND = 1000;

export function formatCooldownRemaining(msLeft: number): string {
    const safe = Math.max(0, msLeft);
    const m = Math.floor(safe / MS_PER_MINUTE);
    const s = Math.floor((safe % MS_PER_MINUTE) / MS_PER_SECOND);
    return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export interface RefreshHooks {
    setRefreshing: (next: boolean) => void;
    setCooldownEndsAt: (next: number) => void;
}

export function makeRefreshFn(slug: string, store: RunewatchStore, hooks: RefreshHooks): () => Promise<void> {
    return async () => {
        hooks.setRefreshing(true);
        try {
            const result = await postRefresh(slug);
            if (result.cooldownRemainingMs && result.cooldownRemainingMs > 0) {
                hooks.setCooldownEndsAt(Date.now() + result.cooldownRemainingMs);
            }
            if (result.ok) await store.refresh();
        } finally {
            hooks.setRefreshing(false);
        }
    };
}

function makeSeedEffect(store: RunewatchStore, cooldownEndsAt: Signal<number>): Disposable {
    const seedRef = { done: false };
    return effect(() => {
        if (seedRef.done) return;
        const cd = store.data$().cooldown;
        if (cd === null) return;
        if (cd.cooldownRemainingMs > 0) cooldownEndsAt.set(Date.now() + cd.cooldownRemainingMs);
        seedRef.done = true;
    });
}

function applyBtnState(refreshBtn: Instance<HTMLButtonElement>, disabled: boolean, text: string): void {
    refreshBtn.el.disabled = disabled;
    refreshBtn.setText(text);
}

function makeUiEffect(
    refreshBtn: Instance<HTMLButtonElement>,
    cooldownEndsAt: Signal<number>,
    isRefreshing: Signal<boolean>,
): Disposable {
    return effect(() => {
        if (isRefreshing()) {
            applyBtnState(refreshBtn, true, "Refreshing…");
            return;
        }
        const endsAt = cooldownEndsAt();
        if (endsAt === 0) {
            applyBtnState(refreshBtn, false, "Refresh now");
            return;
        }
        const remaining = endsAt - timeStore.now$();
        if (remaining > 0) {
            applyBtnState(refreshBtn, true, `Cooldown: ${formatCooldownRemaining(remaining)}`);
            return;
        }
        cooldownEndsAt.set(0);
    });
}

export interface CooldownWiring {
    dispose: () => void;
    hooks: RefreshHooks;
}

export function wireCooldown(refreshBtn: Instance<HTMLButtonElement>, store: RunewatchStore): CooldownWiring {
    const cooldownEndsAt = signal(0);
    const isRefreshing = signal(false);
    const seedEffect = makeSeedEffect(store, cooldownEndsAt);
    const uiEffect = makeUiEffect(refreshBtn, cooldownEndsAt, isRefreshing);
    return {
        dispose: () => {
            seedEffect.dispose();
            uiEffect.dispose();
        },
        hooks: {
            setRefreshing: (next) => isRefreshing.set(next),
            setCooldownEndsAt: (next) => cooldownEndsAt.set(next),
        },
    };
}
