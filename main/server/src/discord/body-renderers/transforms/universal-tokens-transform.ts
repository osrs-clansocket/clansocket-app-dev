import type { TokenSource } from "../render-template.js";

const MS_PER_SECOND = 1000;
const HOUR_NIGHT_END = 6;
const HOUR_MORNING_END = 12;
const HOUR_AFTERNOON_END = 18;

const PERIOD_NIGHT = "Night";
const PERIOD_MORNING = "Morning";
const PERIOD_AFTERNOON = "Afternoon";
const PERIOD_EVENING = "Evening";

const ISO_DATE_LENGTH = 10;

export interface UniversalTokenInput {
    accountType: string;
    combatLevel: number | null;
    totalLevel: number | null;
    clanMemberCount: number | null;
    eventReceivedAt: number;
}

const PERIOD_THRESHOLDS: ReadonlyArray<readonly [hourBefore: number, label: string]> = [
    [HOUR_NIGHT_END, PERIOD_NIGHT],
    [HOUR_MORNING_END, PERIOD_MORNING],
    [HOUR_AFTERNOON_END, PERIOD_AFTERNOON],
];

function periodFor(hour: number): string {
    for (const [before, label] of PERIOD_THRESHOLDS) if (hour < before) return label;
    return PERIOD_EVENING;
}

export function buildUniversalTokens(input: UniversalTokenInput): TokenSource {
    const unixSeconds = Math.floor(input.eventReceivedAt / MS_PER_SECOND);
    const d = new Date(input.eventReceivedAt);
    const timeOfDay = periodFor(d.getHours());
    const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "long" });
    const isoDate = d.toISOString().slice(0, ISO_DATE_LENGTH);
    return {
        accountType: input.accountType,
        combatLevel: input.combatLevel ?? "",
        totalLevel: input.totalLevel ?? "",
        clanMemberCount: input.clanMemberCount ?? "",
        discordRelativeTime: `<t:${unixSeconds}:R>`,
        discordTime: `<t:${unixSeconds}:t>`,
        discordDate: `<t:${unixSeconds}:D>`,
        discordDateTime: `<t:${unixSeconds}:F>`,
        dayOfWeek,
        timeOfDay,
        isoDate,
    };
}

export function extractUniversalToken(payload: object): UniversalTokenInput {
    const p = payload as Record<string, unknown>;
    return {
        accountType: typeof p.accountType === "string" ? p.accountType : "",
        combatLevel: typeof p.combatLevel === "number" ? p.combatLevel : null,
        totalLevel: typeof p.totalLevel === "number" ? p.totalLevel : null,
        clanMemberCount: typeof p.clanMemberCount === "number" ? p.clanMemberCount : null,
        eventReceivedAt: typeof p.eventReceivedAt === "number" ? p.eventReceivedAt : Date.now(),
    };
}
