import { identityClient } from "../../identity/identity-client/index.js";
import { jsonOrFallback } from "../../fetch-result.js";

export interface ClanAuditEntry {
    id: number;
    ts: number;
    actorSiteAccountId: string | null;
    actorDisplay: string | null;
    action: string;
    source: string;
    schemaVersion: number;
    targetType: string | null;
    targetId: string | null;
    payload: Record<string, unknown> | null;
    requestId: string | null;
    elapsedMs: number | null;
}

export interface AuditPage {
    entries: ClanAuditEntry[];
    hasMore: boolean;
    nextBefore: number | null;
}

export interface AuditListOptions {
    before?: number;
    after?: number;
    limit?: number;
    kindPrefix?: string;
    kindExclude?: string;
    actor?: string;
}

export interface ClanRosterDiff {
    eventType: "member_joined" | "member_left" | "rank_changed";
    memberName: string;
    oldValue: string | null;
    newValue: string | null;
    detectedAt: number;
}

export interface AuditVerifyResult {
    ok: boolean;
    rowsChecked: number;
    breakAtId: number | null;
    breakReason: string | null;
}

export interface AuditRevertResult {
    ok: boolean;
    reason?: string;
    newAuditId?: number;
    cascadeCount?: number;
}

function setIfText(params: URLSearchParams, key: string, value: string | undefined): void {
    if (typeof value === "string" && value.length > 0) params.set(key, value);
}

function setIfNumber(params: URLSearchParams, key: string, value: number | undefined): void {
    if (typeof value === "number") params.set(key, String(value));
}

export async function listClanAudit(slug: string, opts: AuditListOptions = {}): Promise<AuditPage> {
    const params = new URLSearchParams();
    setIfNumber(params, "before", opts.before);
    setIfNumber(params, "after", opts.after);
    setIfNumber(params, "limit", opts.limit);
    setIfText(params, "kindPrefix", opts.kindPrefix);
    setIfText(params, "kindExclude", opts.kindExclude);
    setIfText(params, "actor", opts.actor);
    const qs = params.toString();
    const url =
        qs.length > 0
            ? `/api/clans/${encodeURIComponent(slug)}/manage/audit?${qs}`
            : `/api/clans/${encodeURIComponent(slug)}/manage/audit`;
    const res = await identityClient.authedFetch(url);
    return jsonOrFallback<AuditPage>(res, { entries: [], hasMore: false, nextBefore: null });
}

export async function listRosterDiffs(slug: string, toFingerprint: string): Promise<ClanRosterDiff[]> {
    const res = await identityClient.authedFetch(
        `/api/clans/${encodeURIComponent(slug)}/manage/roster-diffs?to=${encodeURIComponent(toFingerprint)}`,
    );
    const body = await jsonOrFallback<{ diffs?: ClanRosterDiff[] }>(res, {});
    return body.diffs ?? [];
}

export async function verifyAuditChain(slug: string): Promise<AuditVerifyResult> {
    const res = await identityClient.authedFetch(`/api/clans/${encodeURIComponent(slug)}/manage/audit/verify`);
    return jsonOrFallback<AuditVerifyResult>(res, {
        ok: false,
        rowsChecked: 0,
        breakAtId: null,
        breakReason: "request_failed",
    });
}

export async function revertEntry(slug: string, auditId: number): Promise<AuditRevertResult> {
    const res = await identityClient.authedFetch(
        `/api/clans/${encodeURIComponent(slug)}/manage/audit/${encodeURIComponent(String(auditId))}/revert`,
        { method: "POST" },
    );
    if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, reason: body.error ?? "request_failed" };
    }
    return (await res.json()) as AuditRevertResult;
}

export function openAuditStream(slug: string, onEntry: (entry: ClanAuditEntry) => void): () => void {
    const source = new EventSource(`/api/clans/${encodeURIComponent(slug)}/manage/audit/stream`, {
        withCredentials: true,
    });
    source.addEventListener("message", (event) => {
        try {
            const entry = JSON.parse(event.data) as ClanAuditEntry;
            onEntry(entry);
        } catch {
            return;
        }
    });
    return () => source.close();
}
