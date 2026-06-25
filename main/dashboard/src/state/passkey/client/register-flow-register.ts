import type { PasskeyError, SignupResult } from "./types.js";
import { doRegisterDevice } from "./register-flow-do.js";

export async function signupWithDevice(
    displayName: string,
    deviceName: string | null,
): Promise<SignupResult | PasskeyError> {
    return doRegisterDevice({ mode: "new", displayName }, deviceName);
}

export async function redeemRegisterCode(
    linkCode: string,
    deviceName: string | null,
): Promise<SignupResult | PasskeyError> {
    return doRegisterDevice({ mode: "link", linkCode }, deviceName);
}

export async function recoverCode(backupCode: string, deviceName: string | null): Promise<SignupResult | PasskeyError> {
    return doRegisterDevice({ mode: "recover", backupCode }, deviceName);
}
