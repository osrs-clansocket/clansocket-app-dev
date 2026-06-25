export interface CombatLine {
    target: string;
    dealt: number | null;
}

export interface CombatAccum {
    target: string;
    lastDealtAt: number;
    totalDealt: number;
    interactingId: number | null;
    multipleKills: boolean;
}
