export interface Tooltip {
    readonly what: string;
    readonly why: string;
    readonly how: string;
}

export function makeTooltip(what: string, why: string, how: string): Tooltip {
    return { what, why, how };
}
