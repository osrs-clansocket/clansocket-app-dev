import { WOMClient, METRICS, Skill, Boss, Activity, type Metric, type Period } from "@wise-old-man/utils";
import { readVaultEntry } from "../../clan-vault/index.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { checkRateWindow } from "../dispatcher/rate-window-checker.js";
import { recordSent, recordWom429, recordWomSuccess } from "../../database/wom/rate-window/updater-rate.js";
import { womRateWindow } from "../../database/wom/rate-window/get.js";
import type { WomPayload } from "../types/payload-type.js";
import type {
    CapabilityManifest,
    DataSourceAdapter,
    DataSourceItem,
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";

function humanizeMetric(m: string): string {
    return m.split("_").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

const metricsDataSource: DataSourceAdapter = {
    id: "metrics",
    label: "WOM metrics",
    fetch: async (): Promise<readonly DataSourceItem[]> =>
        METRICS.map((m: string): DataSourceItem => ({ id: m, name: humanizeMetric(m) })),
};

const skillsDataSource: DataSourceAdapter = {
    id: "skills",
    label: "OSRS skills",
    fetch: async (): Promise<readonly DataSourceItem[]> =>
        Object.values(Skill).map((s: string): DataSourceItem => ({ id: s, name: humanizeMetric(s) })),
};

const bossesDataSource: DataSourceAdapter = {
    id: "bosses",
    label: "OSRS bosses",
    fetch: async (): Promise<readonly DataSourceItem[]> =>
        Object.values(Boss).map((b: string): DataSourceItem => ({ id: b, name: humanizeMetric(b) })),
};

const activitiesDataSource: DataSourceAdapter = {
    id: "activities",
    label: "OSRS activities",
    fetch: async (): Promise<readonly DataSourceItem[]> =>
        Object.values(Activity).map((a: string): DataSourceItem => ({ id: a, name: humanizeMetric(a) })),
};

const CAPABILITY_NAME = "wom";
const CAPABILITY_COLOR = "leaf";
const SDK_TIMEOUT_MS = 15_000;

const PLAYER_SNAPSHOT_INPUT: JSONSchema = {
    type: "object",
    required: ["rsn"],
    additionalProperties: false,
    properties: {
        rsn: { type: "string", format: "rsn", minLength: 1, maxLength: 12 },
    },
};

const GROUP_HISCORES_INPUT: JSONSchema = {
    type: "object",
    required: ["metric"],
    additionalProperties: false,
    properties: {
        metric: { type: "string", format: "wom-metric" },
    },
};

const GROUP_DETAILS_INPUT: JSONSchema = {
    type: "object",
    additionalProperties: false,
    properties: {},
};

const GROUP_GAINED_INPUT: JSONSchema = {
    type: "object",
    required: ["metric", "period"],
    additionalProperties: false,
    properties: {
        metric: { type: "string", format: "wom-metric" },
        period: {
            type: "string",
            enum: ["day", "week", "month", "year"],
            enumLabels: ["Day", "Week", "Month", "Year"],
        },
    },
};

const GROUP_NAME_CHANGES_INPUT: JSONSchema = {
    type: "object",
    additionalProperties: false,
    properties: {},
};

const READ_RESULT_SCHEMA: JSONSchema = {
    type: "object",
    properties: {
        data: { type: "object", additionalProperties: true },
        statusCode: { type: "integer" },
    },
};

const READ_RESULT_CLASSES: readonly string[] = ["ok", "not_linked", "no_credentials", "rate_limited", "not_found", "error"];

interface LoadedWom {
    identity: NonNullable<ReturnType<typeof clanWomIdentity>>;
    creds: WomPayload;
}

async function loadWomFor(clanId: string): Promise<LoadedWom | null> {
    const identity = clanWomIdentity(clanId);
    if (!identity) return null;
    const creds = await readVaultEntry<WomPayload>(
        clanId,
        "wom",
        { kind: "system", component: "wom-flow-op" },
        validateWomPayload,
    );
    if (!creds) return null;
    return { identity, creds };
}

function readString(input: Readonly<Record<string, unknown>>, key: string): string {
    const v = input[key];
    if (typeof v !== "string" || v.length === 0) throw new Error(`wom: missing required string "${key}"`);
    return v;
}

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`wom: ${label} timeout`)), SDK_TIMEOUT_MS);
    });
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        if (timer !== undefined) clearTimeout(timer);
    }
}

const ANON_RATE_LIMIT = 20;
const KEYED_RATE_LIMIT = 100;

function reserveRateSlot(clanId: string, hasApiKey: boolean): { proceed: boolean; rateLimit: number } {
    const rateLimit = hasApiKey ? KEYED_RATE_LIMIT : ANON_RATE_LIMIT;
    const outcome = checkRateWindow(clanId, rateLimit, Date.now());
    return { proceed: outcome.proceed, rateLimit };
}

function recordRateOutcome(clanId: string, statusCode: number, rateLimit: number): void {
    const win = womRateWindow(clanId, rateLimit);
    if (statusCode === 429) {
        recordWom429(clanId, win.consecutive_429);
        return;
    }
    recordSent(clanId, win.window_count, rateLimit);
    if (statusCode >= 200 && statusCode < 300) recordWomSuccess(clanId);
}

function resultFromError(err: unknown): OperationResult {
    const sdkErr = err as { statusCode?: number; message?: string };
    const statusCode = sdkErr.statusCode ?? 0;
    if (statusCode === 429) return { result_class: "rate_limited", outputs: { statusCode } };
    if (statusCode === 404) return { result_class: "not_found", outputs: { statusCode } };
    return { result_class: "error", outputs: { statusCode, error: sdkErr.message ?? String(err) } };
}

async function withRateLimit(
    ctx: OperationContext,
    hasApiKey: boolean,
    work: () => Promise<{ data: unknown; statusCode: number }>,
): Promise<OperationResult> {
    const slot = reserveRateSlot(ctx.clanId, hasApiKey);
    if (!slot.proceed) return { result_class: "rate_limited", outputs: { statusCode: 0 } };
    try {
        const { data, statusCode } = await work();
        recordRateOutcome(ctx.clanId, statusCode, slot.rateLimit);
        return { result_class: "ok", outputs: { data: data as Record<string, unknown>, statusCode } };
    } catch (err) {
        const sdkErr = err as { statusCode?: number };
        const sc = sdkErr.statusCode ?? 0;
        recordRateOutcome(ctx.clanId, sc, slot.rateLimit);
        return resultFromError(err);
    }
}

async function playerSnapshotHandler(
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

async function groupHiscoresHandler(
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

async function groupDetailsHandler(
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

async function groupGainedHandler(
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

async function groupNameChangesHandler(
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

function readOp(input_schema: JSONSchema, handler: OperationSpec["handler"]): OperationSpec {
    return {
        safety_tier: "live",
        input_schema,
        output_schema: READ_RESULT_SCHEMA,
        side_effects: { rate_limit_route: "wom-api" },
        validation: {},
        result_classes: READ_RESULT_CLASSES,
        handler,
    };
}

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.2.0",
    capability_color: CAPABILITY_COLOR,
    operations: {
        "wom:player-snapshot": readOp(PLAYER_SNAPSHOT_INPUT, playerSnapshotHandler),
        "wom:group-hiscores": readOp(GROUP_HISCORES_INPUT, groupHiscoresHandler),
        "wom:group-details": readOp(GROUP_DETAILS_INPUT, groupDetailsHandler),
        "wom:group-gained": readOp(GROUP_GAINED_INPUT, groupGainedHandler),
        "wom:group-name-changes": readOp(GROUP_NAME_CHANGES_INPUT, groupNameChangesHandler),
    },
    triggers: {},
    data_sources: {
        metrics: metricsDataSource,
        skills: skillsDataSource,
        bosses: bossesDataSource,
        activities: activitiesDataSource,
    },
};
