export interface ReviewQueueRow {
    readonly id: number;
    readonly flow_id: string;
    readonly flow_name: string;
    readonly execution_id: number;
    readonly action_id: string;
    readonly operation_ref: string | null;
    readonly resolved_inputs_json: string;
    readonly status: string;
    readonly submitted_at: number;
}

export async function listReviewQueue(clanId: string): Promise<readonly ReviewQueueRow[]> {
    const response = await fetch(`/api/flows/${encodeURIComponent(clanId)}/review-queue`);
    if (!response.ok) return [];
    const body = (await response.json()) as { reviews: readonly ReviewQueueRow[] };
    return body.reviews;
}

export async function approveReview(clanId: string, id: number, reason: string | null): Promise<boolean> {
    const response = await fetch(`/api/flows/${encodeURIComponent(clanId)}/review-queue/${id}/approve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { ok: boolean };
    return body.ok;
}

export async function cancelReview(clanId: string, id: number, reason: string | null): Promise<boolean> {
    const response = await fetch(`/api/flows/${encodeURIComponent(clanId)}/review-queue/${id}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
    });
    if (!response.ok) return false;
    const body = (await response.json()) as { ok: boolean };
    return body.ok;
}
