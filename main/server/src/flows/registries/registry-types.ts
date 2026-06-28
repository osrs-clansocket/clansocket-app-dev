export type JSONSchema = Readonly<Record<string, unknown>>;

export interface SideEffectsDescriptor {
    readonly drafts_first?: boolean;
    readonly writes_audit?: boolean;
    readonly writes_outbound?: boolean;
    readonly rate_limit_route?: string;
    readonly emits?: readonly string[];
}

export interface ValidationDescriptor {
    readonly bot_permission?: string;
    readonly clansocket_permission?: string;
    readonly rate_limit_route?: string;
}

export interface OperationContext {
    readonly clanId: string;
    readonly guildId?: string;
    readonly botId?: string;
    readonly flowId: string;
    readonly flowName: string;
    readonly flowVersion: number;
    readonly executionId?: string;
}

export interface OperationResult {
    readonly result_class: string;
    readonly outputs: Readonly<Record<string, unknown>>;
}

export type SafetyTier = "live" | "manual";

export interface OperationSpec {
    readonly safety_tier: SafetyTier;
    readonly input_schema: JSONSchema;
    readonly output_schema: JSONSchema;
    readonly side_effects: SideEffectsDescriptor;
    readonly validation: ValidationDescriptor;
    readonly result_classes: readonly string[];
    readonly handler: (input: Readonly<Record<string, unknown>>, ctx: OperationContext) => Promise<OperationResult>;
}

export interface TriggerSpec {
    readonly event_source: string;
    readonly payload_schema: JSONSchema;
    readonly triggerable: boolean;
}

export interface CapabilityManifest {
    readonly name: string;
    readonly version: string;
    readonly capability_color: string;
    readonly operations: Readonly<Record<string, OperationSpec>>;
    readonly triggers: Readonly<Record<string, TriggerSpec>>;
}
