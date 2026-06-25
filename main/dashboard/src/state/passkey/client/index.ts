import {
    attachPasskey,
    createLinkCode,
    generateBackupCodes,
    backupMeta,
    listDevices,
    revokeDevice,
} from "./device-mgmt.js";
import { recoverCode, redeemRegisterCode, signinWithDevice, signupWithDevice } from "./register-flow.js";

export {
    LINK_CODE_DIGITS,
    PASSKEY_ERR,
    isPasskeyError,
    type PasskeyDevice,
    type PasskeyError,
    type SignupResult,
} from "./types.js";

export const passkeyClient = {
    signupWithDevice,
    redeemRegisterCode,
    recoverCode,
    signinWithDevice,
    createLinkCode,
    generateBackupCodes,
    backupMeta,
    listDevices,
    revokeDevice,
    attachPasskey,
};
