import {
    ALLOWED_TOKENS_BY_PROPERTY,
    CANVAS_BOUND_MIN,
    CANVAS_BOUND_MAX,
    Z_INDEX_MIN,
    Z_INDEX_MAX,
    TEXT_MAX_LENGTH,
    IMAGE_KEY_REGEX,
    COMPONENT_ID_REGEX,
    isAllowedComponentKind,
    type ComponentKind,
} from "@clansocket/constants/clan-homepage-tokens";
import type { ValidatedComponent, ValidationError, ValidationResult } from "./homepage-validation-types.js";

function clamp(n: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, Math.floor(n)));
}

function stripHtmlTags(s: string): string {
    let out = "";
    let inTag = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inTag) {
            if (ch === ">") inTag = false;
            continue;
        }
        if (ch === "<") {
            inTag = true;
            continue;
        }
        out += ch;
    }
    return out;
}

function isPresentObject(v: unknown): v is Record<string, unknown> {
    return v !== undefined && v !== null && typeof v === "object";
}

function isAllowedTokenValue(property: string, value: string): boolean {
    const allowlist = ALLOWED_TOKENS_BY_PROPERTY[property];
    if (allowlist === undefined) return false;
    return allowlist.includes(value);
}

function validateOne(raw: unknown, errors: ValidationError[]): ValidatedComponent | null {
    if (raw === null || typeof raw !== "object") {
        errors.push({ componentId: "?", code: "shape", detail: "component must be object" });
        return null;
    }
    const r = raw as Record<string, unknown>;
    const componentId = typeof r.componentId === "string" ? r.componentId : "";
    if (!COMPONENT_ID_REGEX.test(componentId)) {
        errors.push({ componentId: componentId || "?", code: "component_id", detail: "invalid component_id" });
        return null;
    }
    const kind = r.componentName;
    if (typeof kind !== "string" || !isAllowedComponentKind(kind)) {
        errors.push({ componentId, code: "component_name", detail: `unknown kind: ${String(kind)}` });
        return null;
    }
    const canvasX = clamp(Number(r.canvasX), CANVAS_BOUND_MIN, CANVAS_BOUND_MAX);
    const canvasY = clamp(Number(r.canvasY), CANVAS_BOUND_MIN, CANVAS_BOUND_MAX);
    const canvasW = clamp(Number(r.canvasW), 1, CANVAS_BOUND_MAX);
    const canvasH = clamp(Number(r.canvasH), 1, CANVAS_BOUND_MAX);
    const zIndex = clamp(Number(r.zIndex ?? 0), Z_INDEX_MIN, Z_INDEX_MAX);
    const payload: ValidatedComponent["payload"] = {};
    const rawPayload = r.payload;
    if (isPresentObject(rawPayload)) {
        if (typeof rawPayload.text === "string") {
            const stripped = stripHtmlTags(rawPayload.text).slice(0, TEXT_MAX_LENGTH);
            payload.text = stripped;
        }
        if (typeof rawPayload.imageKey === "string") {
            if (!IMAGE_KEY_REGEX.test(rawPayload.imageKey)) {
                errors.push({ componentId, code: "image_key", detail: "invalid image key format" });
                return null;
            }
            payload.imageKey = rawPayload.imageKey;
        }
        if (typeof rawPayload.imageVersion === "number") payload.imageVersion = rawPayload.imageVersion;
        if (typeof rawPayload.label === "string") payload.label = rawPayload.label.slice(0, TEXT_MAX_LENGTH);
        if (typeof rawPayload.value === "string") payload.value = rawPayload.value.slice(0, TEXT_MAX_LENGTH);
    }
    const tokenOverrides: Record<string, string> = {};
    const rawOverrides = r.tokenOverrides;
    if (isPresentObject(rawOverrides)) {
        for (const [prop, val] of Object.entries(rawOverrides)) {
            if (typeof val !== "string") continue;
            if (ALLOWED_TOKENS_BY_PROPERTY[prop] === undefined) {
                errors.push({ componentId, code: "unknown_property", detail: prop });
                return null;
            }
            if (!isAllowedTokenValue(prop, val)) {
                errors.push({ componentId, code: "value_not_allowed", detail: `${prop}=${val}` });
                return null;
            }
            tokenOverrides[prop] = val;
        }
    }
    const parentId = typeof r.parentId === "string" && COMPONENT_ID_REGEX.test(r.parentId) ? r.parentId : null;
    return {
        componentId,
        componentName: kind as ComponentKind,
        canvasX,
        canvasY,
        canvasW,
        canvasH,
        zIndex,
        payload,
        tokenOverrides,
        parentId,
    };
}

function validateParents(components: ValidatedComponent[], errors: ValidationError[]): void {
    const byId = new Map(components.map((c) => [c.componentId, c]));
    for (const c of components) {
        if (c.parentId === null) continue;
        const parent = byId.get(c.parentId);
        if (parent === undefined) {
            errors.push({
                componentId: c.componentId,
                code: "parent_missing",
                detail: `parent ${c.parentId} not in save`,
            });
            c.parentId = null;
            continue;
        }
        if (parent.componentName !== "container") {
            errors.push({
                componentId: c.componentId,
                code: "parent_not_container",
                detail: `parent ${c.parentId} is ${parent.componentName}`,
            });
            c.parentId = null;
            continue;
        }
        let cursor: ValidatedComponent | undefined = parent;
        const seen = new Set<string>([c.componentId]);
        while (cursor !== undefined && cursor.parentId !== null) {
            if (seen.has(cursor.componentId)) {
                errors.push({
                    componentId: c.componentId,
                    code: "parent_cycle",
                    detail: `cycle through ${cursor.componentId}`,
                });
                c.parentId = null;
                break;
            }
            seen.add(cursor.componentId);
            cursor = byId.get(cursor.parentId);
        }
    }
}

export function validateComponents(raw: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    if (!Array.isArray(raw)) {
        errors.push({ componentId: "?", code: "shape", detail: "components must be array" });
        return { components: [], errors };
    }
    const components: ValidatedComponent[] = [];
    const seenIds = new Set<string>();
    for (const item of raw) {
        const v = validateOne(item, errors);
        if (v === null) continue;
        if (seenIds.has(v.componentId)) {
            errors.push({ componentId: v.componentId, code: "duplicate_id", detail: "duplicate component_id" });
            continue;
        }
        seenIds.add(v.componentId);
        components.push(v);
    }
    validateParents(components, errors);
    return { components, errors };
}

export type { ValidatedComponent, ValidationError, ValidationResult };
