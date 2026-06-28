import { readVaultEntry } from "../../clan-vault/index.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { checkRateWindow } from "../dispatcher/rate-window-checker.js";
import { recordSent, recordWom429, recordWomSuccess } from "../../database/wom/rate-window/updater-rate.js";
import { womRateWindow } from "../../database/wom/rate-window/get.js";
import type { WomPayload } from "../types/payload-type.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";

export const CAPABILITY_NAME = "wom";
export const CAPABILITY_COLOR = "leaf";
export const SDK_TIMEOUT_MS = 15_000;
export const READ_RESULT_CLASSES: readonly string[] = [
    "ok",
    "not_linked",
    "no_credentials",
    "rate_limited",
    "not_found",
    "error",
];

export interface LoadedWom {
    identity: NonNullable<ReturnType<typeof clanWomIdentity>>;
    creds: WomPayload;
}

export async function loadWomFor(clanId: string): Promise<LoadedWom | null> {
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

export function readString(input: Readonly<Record<string, unknown>>, key: string): string {
    const v = input[key];
    if (typeof v !== "string" || v.length === 0) throw new Error(`wom: missing required string "${key}"`);
    return v;
}

export async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
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

export async function withRateLimit(
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
