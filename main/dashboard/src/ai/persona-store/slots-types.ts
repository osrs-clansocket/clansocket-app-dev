export const PROSE = "prose" as const;
export const NUMBER = "number" as const;

export const IDENTITY = "identity" as const;
export const ENGAGEMENT = "engagement" as const;
export const POLICY = "policy" as const;
export const DOMAIN = "domain" as const;

export const CTRL_ENTRY = "entry" as const;
export const CTRL_BLOCK = "block" as const;
export const CTRL_NUMBER = "number" as const;
export const CTRL_RANGE = "range" as const;
export const CTRL_TOGGLE = "toggle" as const;
export const CTRL_SELECT = "select" as const;

export type SlotType = typeof PROSE | typeof NUMBER;
export type SlotTier = typeof IDENTITY | typeof ENGAGEMENT | typeof POLICY | typeof DOMAIN;
export type ControlType =
    | typeof CTRL_ENTRY
    | typeof CTRL_BLOCK
    | typeof CTRL_NUMBER
    | typeof CTRL_RANGE
    | typeof CTRL_TOGGLE
    | typeof CTRL_SELECT;

export interface SlotBounds {
    readonly min?: number;
    readonly max?: number;
}

export interface SlotMeta {
    readonly key: string;
    readonly tier: SlotTier;
    readonly type: SlotType;
    readonly control: ControlType;
    readonly displayName: string;
    readonly icon: string;
    readonly description: string;
    readonly bounds?: SlotBounds;
    readonly options?: readonly string[];
    readonly requiresMode?: string;
}

export type SlotTuple = readonly [
    key: string,
    type: SlotType,
    control: ControlType,
    displayName: string,
    icon: string,
    description: string,
    extras?: { bounds?: SlotBounds; options?: readonly string[]; requiresMode?: string },
];

export function buildSlot(tier: SlotTier, tuple: SlotTuple): SlotMeta {
    const [key, type, control, displayName, icon, description, extras] = tuple;
    const base: SlotMeta = { key, tier, type, control, displayName, icon, description };
    return {
        ...base,
        ...(extras?.bounds !== undefined && { bounds: extras.bounds }),
        ...(extras?.options !== undefined && { options: extras.options }),
        ...(extras?.requiresMode !== undefined && { requiresMode: extras.requiresMode }),
    };
}
