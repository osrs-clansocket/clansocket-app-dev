export interface BrandingSnapshot {
    iconKind: string | null;
    iconValue: string | null;
    color: string | null;
}

export function brandingSnapshot(
    iconKind: string | null,
    iconValue: string | null,
    color: string | null,
): BrandingSnapshot {
    return { iconKind, iconValue, color };
}
