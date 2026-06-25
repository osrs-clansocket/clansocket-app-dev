import logger from "@clansocket/logger";
import { upsertPlayerFreshness } from "../../database/wom/freshness/upsert-freshness.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { saturateGroupDetails } from "../ingestor/group-saturator.js";
import { saturateMetricHiscores } from "../ingestor/hiscores-saturator.js";
import { saturatePlayerSnapshot } from "../ingestor/player-saturator.js";
import { planSnapshots } from "../ingestor/snapshot-planner.js";
import { mapChanges, type NameChangesResponse } from "../mappers/name-changes-mapper.js";
import { consumeChanges } from "./name-change-consumer.js";

const KIND_GROUP_DETAILS = "group-details";
const KIND_GROUP_HISCORES = "group-hiscores";
const KIND_GROUP_NAME_CHANGES = "group-name-changes";
const KIND_PLAYER_SNAPSHOT = "player-snapshot";
const KIND_VERIFY = "verify-credentials";

function readMetricBody(bodyJson: string | null): string {
    if (!bodyJson) return "overall";
    try {
        const body = JSON.parse(bodyJson) as { metric?: string };
        return typeof body.metric === "string" ? body.metric : "overall";
    } catch {
        return "overall";
    }
}

function routeNameChanges(clanId: string, response: unknown): void {
    if (!Array.isArray(response)) return;
    consumeChanges(clanId, mapChanges(response as NameChangesResponse));
}

function routePlayerSnapshot(clanId: string, womGroupId: number, response: unknown): void {
    const result = saturatePlayerSnapshot(clanId, womGroupId, response);
    if (result !== null && result.updatedAtMs > 0) {
        upsertPlayerFreshness(clanId, result.accountHash, result.womPlayerId, result.updatedAtMs);
    }
}

function routeGroupDetails(clanId: string, womGroupId: number, response: unknown): void {
    saturateGroupDetails(clanId, womGroupId, response);
    planSnapshots(clanId, womGroupId, response);
}

interface WomDispatchArgs {
    clanId: string;
    womGroupId: number;
    requestKind: string;
    bodyJson: string | null;
    response: unknown;
}

function dispatchWomKind(a: WomDispatchArgs): void {
    const { clanId, womGroupId, requestKind, bodyJson, response } = a;
    switch (requestKind) {
        case KIND_GROUP_DETAILS:
            return routeGroupDetails(clanId, womGroupId, response);
        case KIND_GROUP_HISCORES:
            saturateMetricHiscores(clanId, womGroupId, readMetricBody(bodyJson), response);
            return;
        case KIND_GROUP_NAME_CHANGES:
            return routeNameChanges(clanId, response);
        case KIND_PLAYER_SNAPSHOT:
            return routePlayerSnapshot(clanId, womGroupId, response);
        case KIND_VERIFY:
            return;
        default:
            logger.warn(`[wom-route] unhandled request_kind=${requestKind}`);
    }
}

export function routeWomResponse(
    clanId: string,
    requestKind: string,
    bodyJson: string | null,
    response: unknown,
): void {
    const identity = clanWomIdentity(clanId);
    if (!identity) {
        logger.warn(`[wom-route] no identity for clan=${clanId}; skipping response routing for ${requestKind}`);
        return;
    }
    dispatchWomKind({ clanId, requestKind, bodyJson, response, womGroupId: identity.wom_group_id });
}
