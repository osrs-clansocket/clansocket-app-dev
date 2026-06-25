import { isPasskeyError, passkeyClient } from "../../../../state/passkey/client";
import { writeStored } from "../../../../state/persistence";

const PASSKEY_KEY = "device-has-passkey";
const FRESH_BACKUP_CODES_KEY = "clansocket:fresh-backup-codes";
const ACCOUNT_PATH = "/account";
const PASSKEY_FLAG_ON = "1";

export async function performSignup(displayName: string, deviceName: string | null): Promise<void> {
    const signup = await passkeyClient.signupWithDevice(displayName, deviceName);
    if (isPasskeyError(signup)) return;
    writeStored(PASSKEY_KEY, PASSKEY_FLAG_ON);
    sessionStorage.setItem(
        FRESH_BACKUP_CODES_KEY,
        JSON.stringify({ codes: signup.backupCodes ?? [], file: signup.backupCodesFile ?? "" }),
    );
    window.location.assign(ACCOUNT_PATH);
}

export async function performSignin(): Promise<void> {
    const result = await passkeyClient.signinWithDevice();
    if (isPasskeyError(result)) return;
    writeStored(PASSKEY_KEY, PASSKEY_FLAG_ON);
    window.location.assign(ACCOUNT_PATH);
}
