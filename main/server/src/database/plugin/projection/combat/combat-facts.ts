import { asNumber, asNumberNullable, asString, asStringNullable, type Payload } from "../projection-utils.js";

export interface DealtFacts {
    amount: number;
    hitsplatId: number | null;
    targetKind: string | null;
    targetId: number | null;
    targetName: string | null;
    damageType: string;
}

export interface TakenFacts {
    amount: number;
    hitsplatId: number | null;
    sourceKind: string | null;
    sourceId: number | null;
    sourceName: string | null;
}

function nonPlayerName(name: unknown, kind: string | null): string | null {
    return kind === "PLAYER" ? null : asStringNullable(name);
}

export function extractDealtFacts(payload: Payload): DealtFacts {
    const targetKind = asStringNullable(payload.targetKind);
    const attackStyle = asString(payload.attackStyle, "");
    return {
        targetKind,
        amount: asNumber(payload.amount, 0),
        hitsplatId: asNumberNullable(payload.hitsplatType),
        targetId: asNumberNullable(payload.targetId),
        targetName: nonPlayerName(payload.targetName, targetKind),
        damageType: attackStyle.length > 0 ? attackStyle : "UNKNOWN",
    };
}

export function extractTakenFacts(payload: Payload): TakenFacts {
    const sourceKind = asStringNullable(payload.sourceKind);
    return {
        sourceKind,
        amount: asNumber(payload.amount, 0),
        hitsplatId: asNumberNullable(payload.hitsplatType),
        sourceId: asNumberNullable(payload.sourceId),
        sourceName: nonPlayerName(payload.sourceName, sourceKind),
    };
}
