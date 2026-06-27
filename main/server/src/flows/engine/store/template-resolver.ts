import type { ExecContext } from "../context/exec-context.js";

const PLACEHOLDER_OPEN = "{";
const PLACEHOLDER_CLOSE = "}";

function lookupPath(root: Readonly<Record<string, unknown>>, path: string): unknown {
    const parts = path.split(".");
    let cursor: unknown = root;
    for (const part of parts) {
        if (cursor === null || cursor === undefined || typeof cursor !== "object") return undefined;
        cursor = (cursor as Record<string, unknown>)[part];
    }
    return cursor;
}

function resolveKey(key: string, ctx: ExecContext, nodeId: string): string {
    if (key === "flow_id") return ctx.flowId;
    if (key === "node_id") return nodeId;
    if (key === "exec_id") return String(ctx.executionId);
    if (key === "clan_id") return ctx.clanId;
    if (key.startsWith("entity.")) {
        const v = lookupPath(ctx.entity, key.slice("entity.".length));
        return v === undefined ? "" : String(v);
    }
    if (key.startsWith("ctx.event.")) {
        const v = lookupPath(ctx.event, key.slice("ctx.event.".length));
        return v === undefined ? "" : String(v);
    }
    if (key.startsWith("ctx.variables.")) {
        const v = lookupPath(ctx.variables, key.slice("ctx.variables.".length));
        return v === undefined ? "" : String(v);
    }
    if (key.startsWith("ctx.trackers.")) {
        const v = lookupPath(ctx.trackers, key.slice("ctx.trackers.".length));
        return v === undefined ? "" : String(v);
    }
    return "";
}

export function resolveTemplate(template: string, ctx: ExecContext, nodeId: string): string {
    let out = "";
    let i = 0;
    while (i < template.length) {
        const open = template.indexOf(PLACEHOLDER_OPEN, i);
        if (open < 0) {
            out += template.slice(i);
            break;
        }
        out += template.slice(i, open);
        const close = template.indexOf(PLACEHOLDER_CLOSE, open + 1);
        if (close < 0) {
            out += template.slice(open);
            break;
        }
        const key = template.slice(open + 1, close);
        out += resolveKey(key, ctx, nodeId);
        i = close + 1;
    }
    return out;
}
