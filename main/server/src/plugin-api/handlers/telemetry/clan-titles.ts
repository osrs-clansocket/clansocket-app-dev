import { recordSnapshot } from "../../../database/index.js";
import { sessionReady } from "../../session/socket-state.js";
import { EVENT_CLAN_TITLES_SNAPSHOT } from "../../event-types.js";
import { logPluginError, logPluginEvent } from "../../logger/index.js";
import { isTelemetryAllowed, rejectUnauthed } from "../../session/telemetry-gate.js";
import type { PluginClientMessage } from "../../types/index.js";
import type { DispatchContext } from "../dispatch-types.js";

type ClanTitlesMsg = Extract<PluginClientMessage, { type: "clan_titles_snapshot" }>;

function persistTitles(ctx: DispatchContext, msg: ClanTitlesMsg): void {
    const { state, sessionId } = ctx;
    try {
        const changes = recordSnapshot(state.sockClanId!, {
            sessionId,
            clanId: state.sockClanId!,
            clanName: msg.clanName,
            accountHash: state.sessionAccount!,
            rsn: state.sessionRsn!,
            titles: msg.titles,
            observedAt: Date.now(),
        });
        logPluginEvent(sessionId, EVENT_CLAN_TITLES_SNAPSHOT, {
            changes,
            clanName: msg.clanName,
            titles: msg.titles.length,
            fingerprint: msg.fingerprint,
        });
    } catch (err) {
        logPluginError(sessionId, `clan_titles_snapshot record failed: ${(err as Error).message}`);
    }
}

export function handleTitlesSnapshot(ctx: DispatchContext, msg: ClanTitlesMsg): void {
    const { ws, state } = ctx;
    if (!sessionReady(state) || !state.sessionRsn) {
        rejectUnauthed(ws, state);
        return;
    }
    if (!isTelemetryAllowed(state.clanStatus)) return;
    const dedupKey = `clan_titles_snapshot:`;
    if (state.snapshotHashes.get(dedupKey) === msg.fingerprint) return;
    state.snapshotHashes.set(dedupKey, msg.fingerprint);
    persistTitles(ctx, msg);
}
