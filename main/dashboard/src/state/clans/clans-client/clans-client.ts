import {
    checkManagerStatus,
    fetchClanSeo,
    fetchSeo,
    getClan,
    listClanTitles,
    listManaged,
    removeClan,
    searchClans,
    updateClanSeo,
} from "./clan.js";
import { clearBranding, customizeClanBranding, updateClanBranding, uploadClanIcon } from "./branding.js";
import { listClanAudit, listRosterDiffs, openAuditStream, revertEntry, verifyAuditChain } from "./audit.js";
import {
    approveManagerRequest,
    createClaim,
    denyManagerRequest,
    listClanManagers,
    listManagerRequests,
    requestManaged,
    requestTransfer,
} from "./people/index.js";
import { addWhitelistRank, listWhitelist, revokeWhitelistEntry } from "./whitelist.js";

export const clansClient = {
    listManaged,
    getClan,
    fetchClanSeo,
    fetchSeo,
    updateClanSeo,
    checkManagerStatus,
    searchClans,
    listClanTitles,
    removeClan,
    updateClanBranding,
    uploadClanIcon,
    customizeClanBranding,
    clearBranding,
    listClanAudit,
    listRosterDiffs,
    verifyAuditChain,
    revertEntry,
    openAuditStream,
    createClaim,
    requestTransfer,
    requestManaged,
    listManagerRequests,
    approveManagerRequest,
    denyManagerRequest,
    listClanManagers,
    listWhitelist,
    addWhitelistRank,
    revokeWhitelistEntry,
};
