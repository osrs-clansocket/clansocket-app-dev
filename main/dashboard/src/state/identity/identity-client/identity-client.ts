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
