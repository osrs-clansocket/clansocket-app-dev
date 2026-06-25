import { logout, session, startDiscordLink, startDiscordLogin, startGithubLink, startGithubLogin } from "./auth.js";
import { authedFetch } from "./fetchers/authed-fetcher.js";
import { authedJsonFetch } from "./fetchers/authed-json-fetcher.js";
import {
    cancelRsnRequest,
    getIdentification,
    openIdentificationStream,
    removeRsnBinding,
    requestRsn,
} from "./identification.js";
import { listProviders, unlinkProvider, updateDisplayName } from "./provider-mgmt.js";

export type {
    Identification,
    LinkedProvider,
    PendingClaimConsent,
    PendingRsnRequest,
    SiteAccount,
    VerifiedRsn,
} from "./types.js";
export { DISPLAY_NAME_MAX_LEN, RSN_MAX_LEN } from "./types.js";
export { setCorrelationId } from "./trackers/correlation-tracker.js";
export { loginUrls } from "./auth.js";

export const identityClient = {
    session,
    logout,
    authedFetch,
    authedJsonFetch,
    startGithubLogin,
    startDiscordLogin,
    startGithubLink,
    startDiscordLink,
    updateDisplayName,
    listProviders,
    unlinkProvider,
    getIdentification,
    requestRsn,
    cancelRsnRequest,
    removeRsnBinding,
    openIdentificationStream,
};
