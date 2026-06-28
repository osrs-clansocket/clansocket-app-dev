import { WOMClient, type Metric, type Period } from "@wise-old-man/utils";
import { loadWomFor, readString, withRateLimit, withTimeout } from "./manifest-shared.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";

export async function playerSnapshotHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const loaded = await loadWomFor(ctx.clanId);
    if (!loaded) return { result_class: "not_linked", outputs: {} };
    const rsn = readString(input, "rsn");
    const client = new WOMClient({ apiKey: loaded.creds.api_key, userAgent: loaded.creds.user_agent });
    return withRateLimit(ctx, (loaded.creds.api_key ?? "").length > 0, async () => {
        const data = await withTimeout(client.players.getPlayerDetails(rsn), "player-snapshot");
        return { data, statusCode: 200 };
    });
}

export async function groupHiscoresHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const loaded = await loadWomFor(ctx.clanId);
    if (!loaded) return { result_class: "not_linked", outputs: {} };
    const metric = readString(input, "metric") as Metric;
    const client = new WOMClient({ apiKey: loaded.creds.api_key, userAgent: loaded.creds.user_agent });
    return withRateLimit(ctx, (loaded.creds.api_key ?? "").length > 0, async () => {
        const data = await withTimeout(
            client.groups.getGroupHiscores(loaded.identity.wom_group_id, metric),
            "group-hiscores",
        );
        return { data, statusCode: 200 };
    });
}

export async function groupDetailsHandler(
    _input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const loaded = await loadWomFor(ctx.clanId);
    if (!loaded) return { result_class: "not_linked", outputs: {} };
    const client = new WOMClient({ apiKey: loaded.creds.api_key, userAgent: loaded.creds.user_agent });
    return withRateLimit(ctx, (loaded.creds.api_key ?? "").length > 0, async () => {
        const data = await withTimeout(
            client.groups.getGroupDetails(loaded.identity.wom_group_id),
            "group-details",
        );
        return { data, statusCode: 200 };
    });
}

export async function groupGainedHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const loaded = await loadWomFor(ctx.clanId);
    if (!loaded) return { result_class: "not_linked", outputs: {} };
    const metric = readString(input, "metric") as Metric;
    const period = readString(input, "period") as Period;
    const client = new WOMClient({ apiKey: loaded.creds.api_key, userAgent: loaded.creds.user_agent });
    return withRateLimit(ctx, (loaded.creds.api_key ?? "").length > 0, async () => {
        const data = await withTimeout(
            client.groups.getGroupGains(loaded.identity.wom_group_id, { metric, period }),
            "group-gained",
        );
        return { data, statusCode: 200 };
    });
}

export async function groupNameChangesHandler(
    _input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const loaded = await loadWomFor(ctx.clanId);
    if (!loaded) return { result_class: "not_linked", outputs: {} };
    const client = new WOMClient({ apiKey: loaded.creds.api_key, userAgent: loaded.creds.user_agent });
    return withRateLimit(ctx, (loaded.creds.api_key ?? "").length > 0, async () => {
        const data = await withTimeout(
            client.groups.getGroupNameChanges(loaded.identity.wom_group_id),
            "group-name-changes",
        );
        return { data, statusCode: 200 };
    });
}
