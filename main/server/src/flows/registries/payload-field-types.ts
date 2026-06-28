export type FlowFieldType =
    | "string"
    | "integer"
    | "number"
    | "boolean"
    | "timestamp"
    | "rsn"
    | "clan-rank"
    | "osrs-skill"
    | "osrs-boss"
    | "osrs-activity"
    | "osrs-metric"
    | "region-id"
    | "discord-channel-id"
    | "discord-member-id"
    | "discord-role-id"
    | "discord-guild-id"
    | "discord-webhook-id"
    | "iana-timezone"
    | "cron-preset"
    | "chatbox-color"
    | "mime-type"
    | "channel-type"
    | "verification-level"
    | "loop-interval-preset";

export interface FlowField {
    readonly name: string;
    readonly type: FlowFieldType;
    readonly valueSourceRef?: string;
    readonly required?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly minimum?: number;
    readonly maximum?: number;
    readonly description?: string;
    readonly sqlTable?: string;
    readonly sqlColumn?: string;
}

export type FlowFieldList = readonly FlowField[];

export const ENVELOPE_PAYLOAD_FIELDS: FlowFieldList = [
    { name: "rsn", type: "rsn", valueSourceRef: "rsn", description: "Player RSN (envelope)" },
    { name: "accountType", type: "string", valueSourceRef: "account-type", description: "Account type (envelope)" },
    { name: "regionId", type: "region-id", valueSourceRef: "region-id", description: "World region id (envelope)" },
    { name: "regionName", type: "string", valueSourceRef: "region-name", description: "Region name (envelope)" },
    { name: "area", type: "string", valueSourceRef: "area", description: "Sub-region area (envelope)" },
    { name: "world", type: "integer", description: "Game world number (envelope)" },
    { name: "x", type: "integer", description: "World X coordinate (envelope)" },
    { name: "y", type: "integer", description: "World Y coordinate (envelope)" },
    { name: "plane", type: "integer", description: "Plane / Z coordinate (envelope)" },
    { name: "pluginVersion", type: "string", description: "Reporting plugin version (envelope)" },
    { name: "eventReceivedAt", type: "timestamp", description: "Server receive timestamp (envelope)" },
];
