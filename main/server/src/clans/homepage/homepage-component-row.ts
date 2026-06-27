import { isAllowedComponentKind } from "@clansocket/constants/clan-homepage-tokens";
import type {
    HomepageComponent,
    HomepageComponentKind,
    HomepageComponentPayload,
} from "@clansocket/constants/clan-homepage-types";

export interface HomepageComponentRow {
    component_id: string;
    component_name: string;
    canvas_x: number;
    canvas_y: number;
    canvas_w: number;
    canvas_h: number;
    z_index: number;
    payload_json: string;
    token_overrides_json: string;
    parent_id: string | null;
}

export const HOMEPAGE_SELECT_COLUMNS = `component_id, component_name, canvas_x, canvas_y, canvas_w, canvas_h,
    z_index, payload_json, token_overrides_json, parent_id`;

export const HOMEPAGE_SELECT_SQL = `SELECT ${HOMEPAGE_SELECT_COLUMNS}
    FROM clan_ui_components
    ORDER BY z_index, component_id`;

export const HOMEPAGE_INSERT_SQL = `INSERT INTO clan_ui_components
    (component_id, component_name, canvas_x, canvas_y, canvas_w, canvas_h,
     z_index, payload_json, token_overrides_json, parent_id, account_hash, rsn, event_received_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function parseJsonObject(raw: string): Record<string, unknown> {
    try {
        const v = JSON.parse(raw);
        return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
    } catch {
        return {};
    }
}

function parseStringMap(raw: string): Record<string, string> {
    const obj = parseJsonObject(raw);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") out[k] = v;
    }
    return out;
}

function parsePayload(raw: string): HomepageComponentPayload {
    const obj = parseJsonObject(raw);
    const out: { text?: string; imageKey?: string; imageVersion?: number; label?: string; value?: string } = {};
    if (typeof obj.text === "string") out.text = obj.text;
    if (typeof obj.imageKey === "string") out.imageKey = obj.imageKey;
    if (typeof obj.imageVersion === "number") out.imageVersion = obj.imageVersion;
    if (typeof obj.label === "string") out.label = obj.label;
    if (typeof obj.value === "string") out.value = obj.value;
    return out;
}

export function rowToComponent(r: HomepageComponentRow): HomepageComponent | null {
    if (!isAllowedComponentKind(r.component_name)) return null;
    return {
        componentId: r.component_id,
        componentName: r.component_name as HomepageComponentKind,
        canvasX: r.canvas_x,
        canvasY: r.canvas_y,
        canvasW: r.canvas_w,
        canvasH: r.canvas_h,
        zIndex: r.z_index,
        payload: parsePayload(r.payload_json),
        tokenOverrides: parseStringMap(r.token_overrides_json),
        parentId: r.parent_id,
    };
}
