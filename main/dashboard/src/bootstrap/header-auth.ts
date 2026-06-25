import { identityClient } from "../state/identity/identity-client/index.js";
import { PASSKEY_ERR, isPasskeyError, passkeyClient } from "../state/passkey/client";
import { readStored, writeStored } from "../state/persistence";

const DEVICE_HAS_PASSKEY_KEY = "device-has-passkey";
const PASSKEY_FLAG_ON = "1";

async function runSignupFlow(): Promise<boolean> {
    const { promptPasskeySignup } = await import("../dom/forms/glass/modals/glass-signup.js");
    const prompt = await promptPasskeySignup();
    if (prompt === null) return false;
    if (prompt.kind === "signin") {
        const result = await passkeyClient.signinWithDevice();
        if (isPasskeyError(result)) return false;
        writeStored(DEVICE_HAS_PASSKEY_KEY, PASSKEY_FLAG_ON);
        window.location.assign("/account");
        return true;
    }
    const signup = await passkeyClient.signupWithDevice(prompt.displayName, prompt.deviceName);
    if (isPasskeyError(signup)) return false;
    writeStored(DEVICE_HAS_PASSKEY_KEY, PASSKEY_FLAG_ON);
    sessionStorage.setItem(
        "clansocket:fresh-backup-codes",
        JSON.stringify({ codes: signup.backupCodes ?? [], file: signup.backupCodesFile ?? "" }),
    );
    window.location.assign("/account");
    return true;
}

async function startDeviceLogin(): Promise<void> {
    if (readStored<string>(DEVICE_HAS_PASSKEY_KEY) !== PASSKEY_FLAG_ON) {
        await runSignupFlow();
        return;
    }
    const result = await passkeyClient.signinWithDevice();
    if (!isPasskeyError(result)) {
        writeStored(DEVICE_HAS_PASSKEY_KEY, PASSKEY_FLAG_ON);
        window.location.assign("/account");
        return;
    }
    if (result.error !== PASSKEY_ERR.aborted && result.error !== PASSKEY_ERR.credentialUnknown) return;
    await runSignupFlow();
}

export function wireLogoutButton(headerEl: HTMLElement, isAuthed: boolean): void {
    const btn = headerEl.querySelector<HTMLButtonElement>("[data-logout]");
    if (!btn) return;
    btn.hidden = !isAuthed;
    btn.addEventListener("click", () => {
        void identityClient.logout().then(() => {
            window.location.assign("/");
        });
    });
}

function wireLoginProviders(popover: HTMLElement): void {
    popover.querySelectorAll<HTMLButtonElement>("[data-login-provider]").forEach((opt) => {
        opt.addEventListener("click", () => {
            const provider = opt.dataset.loginProvider;
            if (provider === "github") identityClient.startGithubLogin();
            else if (provider === "discord") identityClient.startDiscordLogin();
            else if (provider === "device") void startDeviceLogin();
        });
    });
}

export function wireLoginButton(headerEl: HTMLElement, isAuthed: boolean): void {
    const btn = headerEl.querySelector<HTMLButtonElement>("[data-login]");
    const popover = headerEl.querySelector<HTMLElement>("[data-login-popover]");
    if (!btn || !popover) return;
    btn.hidden = isAuthed;
    if (isAuthed) return;
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        popover.hidden = !popover.hidden;
    });
    wireLoginProviders(popover);
    document.addEventListener("click", (e) => {
        if (popover.hidden) return;
        const target = e.target as Node;
        if (popover.contains(target) || btn.contains(target)) return;
        popover.hidden = true;
    });
}
