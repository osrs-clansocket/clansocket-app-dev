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
