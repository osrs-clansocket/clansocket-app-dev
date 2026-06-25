import { button, div, type Instance } from "../../../factory";
import { renderVaultSetup } from "./vault-setup.js";
import { renderVaultUnlock } from "./vault-unlock.js";
import { addKeyForm } from "./add-key-form";
import { mountQuipCard, type QuipCardHandle } from "../quips/core/quip-card.js";
import type { QuipSet } from "../quips/core/quip-types.js";
import { VAULT_LOCKED_QUIPS } from "../quips/vault-locked-quip.js";
import { VAULT_NO_KEY_QUIPS } from "../quips/no-key-quip.js";
import { VAULT_SETUP_QUIPS } from "../quips/vault-setup-quip.js";
import { AI_BAR_VAULT_HOST_CLASS } from "../../../../shared/constants/ai-bar-constants.js";

export type VaultState = "no-vault" | "locked" | "no-key";

const BTN_CLASS = "ai-bar__auth-btn";
const GATE_CLASS = "ai-bar__vault-gate";
const FORM_WRAP_CLASS = "ai-bar__vault-form";

interface Copy {
    readonly quipSet: QuipSet;
    readonly btn: string;
}

const COPY: Record<VaultState, Copy> = {
    "no-vault": { quipSet: VAULT_SETUP_QUIPS, btn: "Set up vault" },
    locked: { quipSet: VAULT_LOCKED_QUIPS, btn: "Enter passphrase" },
    "no-key": { quipSet: VAULT_NO_KEY_QUIPS, btn: "Set AI key" },
};

interface VaultGateState {
    host: Instance;
    cardHandle: QuipCardHandle | null;
    formWrap: Instance | null;
}
const STATE = new WeakMap<HTMLElement, VaultGateState>();

function ensureVaultState(container: HTMLElement): VaultGateState {
    const cached = STATE.get(container);
    if (cached !== undefined) return cached;
    const host = div({ classes: [AI_BAR_VAULT_HOST_CLASS], context: null, meta: null });
    host.mount(container);
    const state: VaultGateState = { host, cardHandle: null, formWrap: null };
    STATE.set(container, state);
    return state;
}

function clearGate(container: HTMLElement): void {
    const state = STATE.get(container);
    if (state === undefined) return;
    if (state.cardHandle !== null) {
        state.cardHandle.teardown();
        state.cardHandle = null;
    }
    if (state.formWrap !== null) {
        state.formWrap.destroy();
        state.formWrap = null;
    }
}

function mountForm(container: HTMLElement, state: VaultState): void {
    clearGate(container);
    const gateState = ensureVaultState(container);
    const wrap = div({ classes: [FORM_WRAP_CLASS], context: null, meta: null });
    gateState.host.addChild(wrap);
    gateState.formWrap = wrap;
    const onCancel = (): void => {
        if (gateState.formWrap === wrap) {
            wrap.destroy();
            gateState.formWrap = null;
        }
        showVaultGate(container, state);
    };
    if (state === "no-vault") renderVaultSetup(wrap.el, wrap.el, { onCancel });
    else if (state === "locked") renderVaultUnlock(wrap.el, wrap.el, { onCancel });
    else addKeyForm(wrap.el, { onCancel });
}

export function showVaultGate(container: HTMLElement, state: VaultState): void {
    clearGate(container);
    const gateState = ensureVaultState(container);
    const copy = COPY[state];
    const action = button({
        classes: [BTN_CLASS, `${BTN_CLASS}--vault`],
        text: copy.btn,
        context: "open the vault setup, unlock, or add-key form",
        meta: ["action"],
        onClick: () => mountForm(container, state),
    });
    const handle: QuipCardHandle = mountQuipCard({
        quipSet: copy.quipSet,
        actions: [action],
        extraCardClasses: [GATE_CLASS],
    });
    gateState.host.addChild(handle.card);
    gateState.cardHandle = handle;
}

export function hideVaultGate(container: HTMLElement): void {
    clearGate(container);
}
