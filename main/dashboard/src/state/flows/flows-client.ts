export type SafetyTier = "live" | "manual";

export interface OperationSummary {
    readonly safety_tier: SafetyTier;
    readonly input_schema: Readonly<Record<string, unknown>>;
    readonly output_schema: Readonly<Record<string, unknown>>;
    readonly result_classes: readonly string[];
    readonly side_effects: Readonly<Record<string, unknown>>;
}

export interface TriggerSummary {
    readonly event_source: string;
    readonly payload_schema: Readonly<Record<string, unknown>>;
    readonly triggerable: boolean;
}

export interface CapabilitySummary {
    readonly name: string;
    readonly version: string;
    readonly capability_color: string;
    readonly operations: Record<string, OperationSummary>;
    readonly triggers: Record<string, TriggerSummary>;
    readonly data_sources: readonly string[];
}

export interface CapabilitiesResponse {
    readonly capabilities: readonly CapabilitySummary[];
}

export interface FlowListEntry {
    readonly flow_id: string;
    readonly flow_name: string;
    readonly enabled: number;
    readonly archived: number;
    readonly published_version: number | null;
    readonly created_at: number;
    readonly updated_at: number;
}

export async function fetchCapabilities(): Promise<CapabilitiesResponse> {
    const response = await fetch("/api/flows/capabilities");
    if (!response.ok) throw new Error(`fetchCapabilities failed: ${response.status}`);
    return (await response.json()) as CapabilitiesResponse;
}

export async function listFlows(clanId: string): Promise<readonly FlowListEntry[]> {
    const response = await fetch(`/api/flows/${encodeURIComponent(clanId)}`);
    if (!response.ok) return [];
    const body = (await response.json()) as { flows: readonly FlowListEntry[] };
    return body.flows;
}

export async function saveFlow(clanId: string, flowId: string, flowName: string, definition: unknown): Promise<void> {
    const response = await fetch(`/api/flows/${encodeURIComponent(clanId)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flow_id: flowId, flow_name: flowName, definition }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`saveFlow failed: ${response.status} ${text}`);
    }
}

export async function publishFlow(clanId: string, flowId: string): Promise<{ flow_id: string; version: number }> {
    const response = await fetch(
        `/api/flows/${encodeURIComponent(clanId)}/${encodeURIComponent(flowId)}/publish`,
        { method: "POST" },
    );
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`publishFlow failed: ${response.status} ${text}`);
    }
    return (await response.json()) as { flow_id: string; version: number };
}

export async function setFlowEnabledOnServer(clanId: string, flowId: string, enabled: boolean): Promise<void> {
    const response = await fetch(
        `/api/flows/${encodeURIComponent(clanId)}/${encodeURIComponent(flowId)}/enable`,
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ enabled }),
        },
    );
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`setFlowEnabled failed: ${response.status} ${text}`);
    }
}

export async function archiveFlow(clanId: string, flowId: string): Promise<void> {
    const response = await fetch(`/api/flows/${encodeURIComponent(clanId)}/${encodeURIComponent(flowId)}`, {
        method: "DELETE",
    });
    if (!response.ok && response.status !== 204) {
        const text = await response.text();
        throw new Error(`archiveFlow failed: ${response.status} ${text}`);
    }
}

export interface DryRunStep {
    readonly node_id: string;
    readonly node_kind: string;
    readonly decision: "would-fire" | "would-skip" | "would-pause" | "would-fail";
    readonly reason?: string;
}

export interface DryRunTrace {
    readonly flow_id: string;
    readonly flow_version: number;
    readonly steps: readonly DryRunStep[];
    readonly outcome: "completed" | "exited" | "failed";
    readonly final_node_id: string;
}

export interface DryRunResponse {
    readonly trace: DryRunTrace;
}

export async function dryRunFlow(definition: unknown, clanId: string): Promise<DryRunResponse> {
    const response = await fetch("/api/flows/dry-run-direct", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ definition, clan_id: clanId, event: {}, entity: {} }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`dryRunFlow failed: ${response.status} ${text}`);
    }
    return (await response.json()) as DryRunResponse;
}
