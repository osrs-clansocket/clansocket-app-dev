import { WOMClient, type Metric, type Period } from "@wise-old-man/utils";

import type { PendingWomRow } from "../../database/wom/outbound/list-pending.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";

export const SDK_CALL_TIMEOUT_MS = 30000;
const GROUPS_PATH_PREFIX = "/groups/";
export const PLAYERS_PATH_PREFIX = "/players/";

export const REQUEST_KIND_GROUP_DETAILS = "group-details";
export const REQUEST_KIND_GROUP_HISCORES = "group-hiscores";
export const REQUEST_KIND_GROUP_NAME_CHANGES = "group-name-changes";
export const REQUEST_KIND_GROUP_GAINED = "group-gained";
export const REQUEST_KIND_PLAYER_SNAPSHOT = "player-snapshot";
export const REQUEST_KIND_VERIFY = "verify-credentials";

function firstPathSegment(path: string, prefix: string): string | null {
    if (!path.startsWith(prefix)) return null;
    const rest = path.substring(prefix.length);
    const slashIdx = rest.indexOf("/");
    return slashIdx === -1 ? rest : rest.substring(0, slashIdx);
}

function groupIdOf(path: string): number | null {
    const seg = firstPathSegment(path, GROUPS_PATH_PREFIX);
    if (seg === null) return null;
    const n = Number(seg);
    if (Number.isNaN(n) || n <= 0) return null;
    return n;
}

export function parseUsernamePath(path: string): string | null {
    const seg = firstPathSegment(path, PLAYERS_PATH_PREFIX);
    if (seg === null || seg.length === 0) return null;
    try {
        return decodeURIComponent(seg);
    } catch {
        return null;
    }
}

function readBody(row: PendingWomRow): Record<string, unknown> {
    if (!row.body_json) return {};
    return JSON.parse(row.body_json) as Record<string, unknown>;
}

function requireGroupId(path: string): number {
    const groupId = groupIdOf(path);
    if (groupId === null) throw new Error(`unknown group request_path for SDK dispatch: ${path}`);
    return groupId;
}

type SdkCallHandler = (client: WOMClient, head: PendingWomRow, body: Record<string, unknown>) => Promise<unknown>;

const SDK_CALL_HANDLERS: Record<string, SdkCallHandler> = {
    [REQUEST_KIND_GROUP_DETAILS]: (client, head) => client.groups.getGroupDetails(requireGroupId(head.request_path)),
    [REQUEST_KIND_GROUP_HISCORES]: (client, head, body) => {
        const metric = (body.metric as Metric | undefined) ?? ("overall" as Metric);
        return client.groups.getGroupHiscores(requireGroupId(head.request_path), metric);
    },
    [REQUEST_KIND_GROUP_NAME_CHANGES]: (client, head) =>
        client.groups.getGroupNameChanges(requireGroupId(head.request_path)),
    [REQUEST_KIND_GROUP_GAINED]: (client, head, body) => {
        const metric = (body.metric as Metric | undefined) ?? ("overall" as Metric);
        const period = (body.period as Period | undefined) ?? ("week" as Period);
        return client.groups.getGroupGains(requireGroupId(head.request_path), { metric, period });
    },
    [REQUEST_KIND_PLAYER_SNAPSHOT]: (client, head) => {
        const username = parseUsernamePath(head.request_path);
        if (username === null) throw new Error(`unknown player request_path for SDK dispatch: ${head.request_path}`);
        return client.players.getPlayerDetails(username);
    },
    [REQUEST_KIND_VERIFY]: (client, head, body) => {
        const code = body.verificationCode as string | undefined;
        if (!isNonBlank(code)) {
            throw new Error(
                `verify-credentials request missing verificationCode in body: queue_id=${head.queue_id} request_path=${head.request_path}`,
            );
        }
        return client.groups.updateAll(requireGroupId(head.request_path), code);
    },
};

async function dispatchSdkCall(client: WOMClient, head: PendingWomRow): Promise<unknown> {
    const handler = SDK_CALL_HANDLERS[head.request_kind];
    if (!handler) throw new Error(`unknown request_kind: ${head.request_kind}`);
    return handler(client, head, readBody(head));
}

export async function dispatchWithTimeout(client: WOMClient, head: PendingWomRow): Promise<unknown> {
    let timer: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("SDK request timeout exceeded")), SDK_CALL_TIMEOUT_MS);
    });
    try {
        return await Promise.race([dispatchSdkCall(client, head), timeoutPromise]);
    } finally {
        if (timer !== undefined) clearTimeout(timer);
    }
}
