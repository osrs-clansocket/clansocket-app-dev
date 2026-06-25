import { recordClanRoster, recordSnapshot } from "../../../database/index.js";
import { logPluginError } from "../../logger/index.js";
import type { PluginClientMessage } from "../../types/index.js";
import type { RosterSnapshotEntry, PluginSocketState } from "../../session/socket-state.js";

type ClaimConsentResponse = Extract<PluginClientMessage, { type: "claim_consent_response" }>;
export type ClanProof = NonNullable<ClaimConsentResponse["clanProof"]>;
export type RosterPayload = NonNullable<ClanProof["roster"]>;
export type TitlesPayload = NonNullable<ClanProof["titles"]>;
export type { ClaimConsentResponse };

export interface RosterIngestArgs {
    state: PluginSocketState;
    clanId: string;
    accountHash: string;
    roster: RosterPayload;
    sessionId: string;
}

export function ingestRosterClaim(args: RosterIngestArgs): void {
    const { state, clanId, accountHash, roster, sessionId } = args;
    try {
        recordClanRoster(clanId, accountHash, roster.fingerprint, roster.members);
        state.lastRosterFingerprint = roster.fingerprint;
        const snapshot = new Map<string, RosterSnapshotEntry>();
        for (const m of roster.members) {
            snapshot.set(m.name.toLowerCase(), { rank: m.rank, joinedAt: m.joinedAt });
        }
        state.lastRosterSnapshot = snapshot;
    } catch (err) {
        logPluginError(sessionId, `claim_consent_response roster ingest failed: ${(err as Error).message}`);
    }
}

export function ingestTitlesClaim(
    state: PluginSocketState,
    clanId: string,
    titles: TitlesPayload,
    sessionId: string,
): void {
    if (!state.sessionAccount || !state.sessionRsn) return;
    try {
        recordSnapshot(clanId, {
            clanId,
            sessionId,
            clanName: titles.clanName,
            accountHash: state.sessionAccount,
            rsn: state.sessionRsn,
            titles: titles.titles,
            observedAt: Date.now(),
        });
    } catch (err) {
        logPluginError(sessionId, `claim_consent_response titles ingest failed: ${(err as Error).message}`);
    }
}
