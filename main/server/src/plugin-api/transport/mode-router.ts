const WORLD_TYPE_PRIORITY: ReadonlyArray<readonly [string, string]> = [
    ["DEADMAN", "deadman"],
    ["BETA_WORLD", "beta"],
    ["QUEST_SPEEDRUNNING", "speedrunning"],
    ["FRESH_START_WORLD", "fresh-start"],
    ["LAST_MAN_STANDING", "lms"],
    ["TOURNAMENT_WORLD", "tournament"],
];

export function modeKey(worldTypes: string[], activity: string | undefined): string {
    const act = (activity ?? "").trim().toLowerCase();
    if (worldTypes.includes("SEASONAL")) {
        if (act.startsWith("leagues ")) {
            let name = act.substring("leagues ".length).trim();
            const sep = name.indexOf(" - ");
            if (sep !== -1) name = name.substring(0, sep).trim();
            name = name
                .split(" ")
                .filter((s) => s.length > 0)
                .join("-");
            return `seasonal-leagues-${name}`;
        }
        return act.startsWith("deadman") ? "seasonal-deadman" : "seasonal-unknown";
    }
    for (const [type, mode] of WORLD_TYPE_PRIORITY) {
        if (worldTypes.includes(type)) return mode;
    }
    return "main";
}
