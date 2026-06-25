import { createInstance } from "../../../../factory";
import { vaultExists } from "../../../../../ai/vault/vault/index.js";
import { isUnlocked, onLockChange } from "../../../../../ai/vault/session.js";
import { renderVaultSetup } from "../vault-setup.js";
import { renderVaultUnlock } from "../vault-unlock.js";
import { type KeySettingsHandle, type KeySettingsOpts, type UnlockedSub } from "./constants.js";
import { renderListView } from "./list.js";
import { renderEditorView } from "./editor/index.js";

interface VaultRenderArgs {
    bodyHost: HTMLElement;
    footerHost: HTMLElement;
    sub: UnlockedSub;
    setSub: (next: UnlockedSub) => void;
    rerender: () => Promise<void>;
    opts: KeySettingsOpts;
}

async function renderUnlocked(args: VaultRenderArgs): Promise<void> {
    const { sub, bodyHost, footerHost, setSub, rerender, opts } = args;
    if (sub.mode === "list") await renderListView(bodyHost, footerHost, setSub, rerender);
    else await renderEditorView({ bodyHost, footerHost, sub, setSub, rerender, opts });
}

async function renderVaultState(args: VaultRenderArgs): Promise<void> {
    const { bodyHost, footerHost, opts } = args;
    if (!(await vaultExists())) {
        renderVaultSetup(bodyHost, footerHost, { onReady: () => opts.onChange?.() });
        return;
    }
    if (!isUnlocked()) {
        renderVaultUnlock(bodyHost, footerHost, { onUnlocked: () => opts.onChange?.() });
        return;
    }
    await renderUnlocked(args);
}

interface KeySettingsCtx {
    body: ReturnType<typeof createInstance>;
    footer: ReturnType<typeof createInstance>;
    bodyHost: HTMLElement;
    footerHost: HTMLElement;
    opts: KeySettingsOpts;
}

function buildRenderState(
    ctx: KeySettingsCtx,
    getSub: () => UnlockedSub,
    setSub: (next: UnlockedSub) => void,
): () => Promise<void> {
    async function renderState(): Promise<void> {
        ctx.body.clear();
        ctx.footer.clear();
        await renderVaultState({
            setSub,
            bodyHost: ctx.bodyHost,
            footerHost: ctx.footerHost,
            sub: getSub(),
            rerender: renderState,
            opts: ctx.opts,
        });
    }
    return renderState;
}

function setupRenderLoop(ctx: KeySettingsCtx): {
    renderState: () => Promise<void>;
    offLockChange: () => void;
    setSub: (next: UnlockedSub) => void;
} {
    let sub: UnlockedSub = { mode: "list" };
    const setSub = (next: UnlockedSub): void => {
        sub = next;
    };
    const renderState = buildRenderState(ctx, () => sub, setSub);
    const offLockChange = onLockChange(() => {
        sub = { mode: "list" };
        renderState().catch(() => undefined);
    });
    return { renderState, offLockChange, setSub };
}

async function renderKeySettings(
    bodyHost: HTMLElement,
    footerHost: HTMLElement,
    opts: KeySettingsOpts = {},
): Promise<KeySettingsHandle> {
    const ctx: KeySettingsCtx = {
        body: createInstance(bodyHost),
        footer: createInstance(footerHost),
        bodyHost,
        footerHost,
        opts,
    };
    const { renderState, offLockChange } = setupRenderLoop(ctx);
    await renderState();
    return {
        el: bodyHost,
        destroy: () => {
            offLockChange();
            ctx.body.clear();
            ctx.footer.clear();
        },
    };
}

export { renderKeySettings };
