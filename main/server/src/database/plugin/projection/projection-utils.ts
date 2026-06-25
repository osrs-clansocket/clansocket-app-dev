import { isNumber, isPlainObject, isString } from "../../../shared/validators/type-guards.js";

export type Payload = Record<string, any>;

export const BUCKET_MS = 60_000;

export interface PlayerIdentity {
    accountHash: string;
    rsn: string | null;
}

export interface SpatialColumns {
    world: number | null;
    x: number | null;
    y: number | null;
    plane: number | null;
    region_id: number | null;
    region_name: string | null;
    area: string | null;
}

export const EMPTY_WHERE: SpatialColumns = Object.freeze({
    world: null,
    x: null,
    y: null,
    plane: null,
    region_id: null,
    region_name: null,
    area: null,
}) as SpatialColumns;

export function asString<T>(v: unknown, fallback: T): string | T {
    return isString(v) ? v : fallback;
}

export function asNumber<T>(v: unknown, fallback: T): number | T {
    return isNumber(v) ? v : fallback;
}

export const asStringNullable = (v: unknown): string | null => asString(v, null);
export const asNumberNullable = (v: unknown): number | null => asNumber(v, null);

export function asObject(v: unknown): Record<string, unknown> | null {
    return isPlainObject(v) ? v : null;
}

export function spatialFrom(source: Record<string, unknown> | null): SpatialColumns {
    if (source === null) return EMPTY_WHERE;
    return {
        world: asNumberNullable(source.world),
        x: asNumberNullable(source.x),
        y: asNumberNullable(source.y),
        plane: asNumberNullable(source.plane),
        region_id: asNumberNullable(source.regionId),
        region_name: asStringNullable(source.regionName),
        area: asStringNullable(source.area),
    };
}

export function extractWhere(p: Payload): SpatialColumns {
    return spatialFrom(asObject(p?.where));
}

const MEMBERS_SUFFIX = " (members)";

export function sanitizeItemName(name: string): string {
    if (name.length < MEMBERS_SUFFIX.length) return name;
    const tail = name.slice(name.length - MEMBERS_SUFFIX.length).toLowerCase();
    if (tail === MEMBERS_SUFFIX) {
        return name.slice(0, name.length - MEMBERS_SUFFIX.length);
    }
    return name;
}

function toTitleCase(s: string): string {
    if (s.length === 0) return s;
    const lower = s.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.substring(1);
}

export function deriveDiaryId(region: string, tier: string): string {
    return `${region.toUpperCase()}_${tier.toUpperCase()}`;
}

export function deriveDiaryName(region: string, tier: string): string {
    return `${toTitleCase(region)} ${toTitleCase(tier)} Diary`;
}
