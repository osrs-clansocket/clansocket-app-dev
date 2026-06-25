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
