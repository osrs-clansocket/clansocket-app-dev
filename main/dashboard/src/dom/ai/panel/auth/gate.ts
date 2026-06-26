import { button, div, slidePanel, wireClick, type Instance, baseProps } from "../../../factory";
import { identityClient } from "../../../../state/identity/identity-client/index.js";
import { PASSKEY_ERR, isPasskeyError, passkeyClient } from "../../../../state/passkey/client";
import { readStored } from "../../../../state/persistence";
import { AUTH_QUIPS } from "../quips/auth-quip.js";
import { mountQuipCard, type QuipCardHandle } from "../quips/core/quip-card.js";
import { buildSignupPanel } from "./gate-signup.js";
import { AI_BAR_AUTH_HOST_CLASS } from "../../../../shared/constants/ai-bar-constants.js";

const BTN_CLASS = "ai-bar__auth-btn";
const PASSKEY_KEY = "device-has-passkey";
const ACCOUNT_PATH = "/account";
const PASSKEY_FLAG_ON = "1";

function buildAuthBtn(
    variant: "github" | "discord" | "device",
    label: string,
    onClick: () => void | Promise<void>,
): Instance<HTMLButtonElement> {
    return button({
        classes: [BTN_CLASS, `${BTN_CLASS}--${variant}`],
        text: label,
        context: `sign in with ${variant}`,
        meta: ["action", "account"],
        onClick,
    });
}

async function tryExistingPasskey(): Promise<"navigated" | "fallthrough" | "abort"> {
    const result = await passkeyClient.signinWithDevice();
    if (!isPasskeyError(result)) {
        window.location.assign(ACCOUNT_PATH);
        return "navigated";
    }
    if (result.error === PASSKEY_ERR.aborted || result.error === PASSKEY_ERR.credentialUnknown) {
        return "fallthrough";
    }
    return "abort";
}

async function trySignin(openPanel: () => void): Promise<void> {
    const hasPasskey = readStored<string>(PASSKEY_KEY) === PASSKEY_FLAG_ON;
    if (!hasPasskey) {
        openPanel();
        return;
    }
    const outcome = await tryExistingPasskey();
    if (outcome === "fallthrough") openPanel();
}

function buildDeviceSignin(): Instance {
    const trigger = buildAuthBtn("device", "Sign in with Device", () => undefined);
    const panel = buildSignupPanel();
    const sp = slidePanel({ context: null, meta: null }, trigger, panel);
    wireClick(trigger.el, (e) => {
        e.preventDefault();
        void trySignin(() => {
            if (!sp.isOpen()) sp.open();
        });
    });
    return sp;
}

interface AuthGateState {
    host: Instance;
    cardHandle: QuipCardHandle | null;
}
const STATE = new WeakMap<HTMLElement, AuthGateState>();

function ensureAuthState(containerEl: HTMLElement): AuthGateState {
    const cached = STATE.get(containerEl);
    if (cached !== undefined) return cached;
    const host = div(baseProps([AI_BAR_AUTH_HOST_CLASS]));
    host.mount(containerEl);
    const state: AuthGateState = { host, cardHandle: null };
    STATE.set(containerEl, state);
    return state;
}

function showAuthGate(containerEl: HTMLElement, _onAuthenticated: () => void): void {
    hideAuthGate(containerEl);
    const state = ensureAuthState(containerEl);
    const teardownRef: { current: (() => void) | null } = { current: null };
    const teardown = (): void => teardownRef.current?.();
    const actions: Instance[] = [
        buildAuthBtn("github", "Sign in with GitHub", () => {
            teardown();
            identityClient.startGithubLogin();
        }),
        buildAuthBtn("discord", "Sign in with Discord", () => {
            teardown();
            identityClient.startDiscordLogin();
        }),
        buildDeviceSignin(),
    ];
    const handle: QuipCardHandle = mountQuipCard({ quipSet: AUTH_QUIPS, actions });
    teardownRef.current = handle.teardown;
    state.host.addChild(handle.card);
    state.cardHandle = handle;
}

function hideAuthGate(containerEl: HTMLElement): void {
    const state = STATE.get(containerEl);
    if (state === undefined) return;
    if (state.cardHandle !== null) {
        state.cardHandle.teardown();
        state.cardHandle = null;
    }
}

export { showAuthGate, hideAuthGate };
