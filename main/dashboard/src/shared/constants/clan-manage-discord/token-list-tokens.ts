export interface TokenInfo {
    token: string;
    label: string;
    sampleValue: string;
}

const TOKEN_RSN: TokenInfo = { token: "{rsn}", label: "RSN", sampleValue: "Varietyz" };

export const UNIVERSAL_TOKENS: readonly TokenInfo[] = [
    { token: "{discordRelativeTime}", label: "Time (relative)", sampleValue: "2 minutes ago" },
    { token: "{discordTime}", label: "Time of day", sampleValue: "8:42 PM" },
    { token: "{discordDate}", label: "Date", sampleValue: "December 14, 2026" },
    { token: "{discordDateTime}", label: "Date+time", sampleValue: "Sun, Dec 14, 2026 8:42 PM" },
    { token: "{dayOfWeek}", label: "Day of week", sampleValue: "Sunday" },
    { token: "{timeOfDay}", label: "Period", sampleValue: "Evening" },
    { token: "{isoDate}", label: "ISO date", sampleValue: "2026-12-14" },
    { token: "{accountType}", label: "Account type", sampleValue: "ironman" },
    { token: "{combatLevel}", label: "Combat level", sampleValue: "126" },
    { token: "{totalLevel}", label: "Total level", sampleValue: "2277" },
    { token: "{clanMemberCount}", label: "Clan size", sampleValue: "47" },
];

export const TOKEN_LIST_BY_TRIGGER: Record<string, readonly TokenInfo[]> = {
    level_up: [
        TOKEN_RSN,
        { token: "{skill}", label: "Skill", sampleValue: "Mining" },
        { token: "{level}", label: "New level", sampleValue: "92" },
        { token: "{xpAtLevel}", label: "XP at level", sampleValue: "6,517,253" },
    ],
    death: [
        TOKEN_RSN,
        { token: "{x}", label: "X", sampleValue: "3210" },
        { token: "{y}", label: "Y", sampleValue: "3424" },
        { token: "{plane}", label: "Plane", sampleValue: "0" },
        { token: "{regionName}", label: "Region", sampleValue: "Karamja" },
        { token: "{causeName}", label: "Cause", sampleValue: "Lava dragon" },
    ],
    slayer: [
        TOKEN_RSN,
        { token: "{count}", label: "Remaining", sampleValue: "0" },
        { token: "{countOriginal}", label: "Original count", sampleValue: "120" },
        { token: "{targetName}", label: "Task target", sampleValue: "Dragon" },
        { token: "{masterName}", label: "Slayer master", sampleValue: "Duradel" },
        { token: "{streak}", label: "Task streak", sampleValue: "42" },
    ],
    loot: [
        TOKEN_RSN,
        { token: "{source}", label: "Source NPC/item", sampleValue: "Vorkath" },
        { token: "{sourceLevel}", label: "Source level", sampleValue: "732" },
        { token: "{gp}", label: "Total GP", sampleValue: "1,420,000" },
        { token: "{gpShort}", label: "GP (short)", sampleValue: "1.42M" },
        { token: "{kc}", label: "Kill count", sampleValue: "184" },
        { token: "{items}", label: "Items", sampleValue: "Vorkath's head, Dragon bones × 1" },
    ],
    pet_drop: [
        TOKEN_RSN,
        { token: "{petName}", label: "Pet name", sampleValue: "Vorki" },
        { token: "{trigger}", label: "Trigger source", sampleValue: "Vorkath" },
    ],
    bank_close: [TOKEN_RSN, { token: "{itemCount}", label: "Item count", sampleValue: "12" }],
    quests: [
        TOKEN_RSN,
        { token: "{completed}", label: "Completed", sampleValue: "146" },
        { token: "{total}", label: "Total", sampleValue: "159" },
    ],
    quest_completed: [TOKEN_RSN, { token: "{name}", label: "Quest name", sampleValue: "Dragon Slayer II" }],
    diaries: [
        TOKEN_RSN,
        { token: "{completed}", label: "Completed", sampleValue: "32" },
        { token: "{total}", label: "Total", sampleValue: "48" },
    ],
    diary_completed: [
        TOKEN_RSN,
        { token: "{region}", label: "Region", sampleValue: "karamja" },
        { token: "{tier}", label: "Tier", sampleValue: "elite" },
    ],
    clue_completed: [
        TOKEN_RSN,
        { token: "{tier}", label: "Tier", sampleValue: "Elite" },
        { token: "{total}", label: "Total", sampleValue: "184" },
    ],
    collection_log_entry: [
        TOKEN_RSN,
        { token: "{itemName}", label: "Item name", sampleValue: "Dragon claws" },
        { token: "{wikiLink}", label: "Wiki link", sampleValue: "https://oldschool.runescape.wiki/w/Dragon_claws" },
    ],
    collection_log_snapshot: [TOKEN_RSN, { token: "{itemCount}", label: "Item count", sampleValue: "742" }],
    combat_achievement_completed: [
        TOKEN_RSN,
        { token: "{name}", label: "CA name", sampleValue: "Verdant Vanquisher" },
        { token: "{tier}", label: "Tier", sampleValue: "Grandmaster" },
        { token: "{points}", label: "Points", sampleValue: "6" },
    ],
    combat_achievements_snapshot: [
        TOKEN_RSN,
        { token: "{totalCompleted}", label: "Total completed", sampleValue: "412" },
    ],
    menu_action: [
        TOKEN_RSN,
        { token: "{action}", label: "Action", sampleValue: "Attack" },
        { token: "{option}", label: "Option", sampleValue: "Level-92" },
        { token: "{target}", label: "Target", sampleValue: "Dragon" },
    ],
    farming_patch: [
        TOKEN_RSN,
        { token: "{regionId}", label: "Region ID", sampleValue: "1234" },
        { token: "{varbitId}", label: "Varbit ID", sampleValue: "4771" },
        { token: "{value}", label: "Value", sampleValue: "57" },
    ],
    clan_chat: [
        TOKEN_RSN,
        { token: "{rank}", label: "Rank", sampleValue: "Captain" },
        { token: "{message}", label: "Message", sampleValue: "wts dragon bones 5k ea" },
    ],
};
