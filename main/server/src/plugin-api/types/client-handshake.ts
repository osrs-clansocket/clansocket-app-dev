import type { ClaimConsentResponse } from "./claim-consent-response.js";
import type { IdentityMsg } from "./identity-msg.js";
import type { HelloMsg, LoginStateMsg, PingMsg, ResponseMsg } from "./handshake-msgs.js";

export type { ClaimConsentResponse } from "./claim-consent-response.js";
export type { IdentityMsg } from "./identity-msg.js";
export type { HelloMsg, PingMsg, ResponseMsg, LoginStateMsg } from "./handshake-msgs.js";

export type HandshakeClientMessage =
    | HelloMsg
    | PingMsg
    | ResponseMsg
    | ClaimConsentResponse
    | IdentityMsg
    | LoginStateMsg;
