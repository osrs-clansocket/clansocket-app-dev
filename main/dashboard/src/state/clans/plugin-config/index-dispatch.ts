import { clearGlobalPreset, clearMemberOverride, publishGlobalPreset, publishMemberOverride } from "./client.js";
import { runWithLimit } from "../../../shared/limiters/concurrency-limiter.js";
import type { Scope, Values } from "./index-types.js";

const MEMBER_OVERRIDE_CONCURRENCY = 6;

export async function dispatchPublish(slug: string, scope: Scope, values: Values): Promise<boolean> {
    if (scope.kind === "global") return publishGlobalPreset(slug, values);
    const hashes = Array.from(scope.set);
    const results = await runWithLimit(hashes, MEMBER_OVERRIDE_CONCURRENCY, (h) =>
        publishMemberOverride(slug, h, values),
    );
    return results.every((r) => r);
}

export async function dispatchClear(slug: string, scope: Scope): Promise<boolean> {
    if (scope.kind === "global") return clearGlobalPreset(slug);
    const hashes = Array.from(scope.set);
    const results = await runWithLimit(hashes, MEMBER_OVERRIDE_CONCURRENCY, (h) => clearMemberOverride(slug, h));
    return results.every((r) => r);
}
