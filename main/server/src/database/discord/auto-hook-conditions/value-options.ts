import { clanCol, pluginCol } from "./col-curries.js";
import type { Resolver } from "./distinct-resolvers.js";

const members = clanCol("clan_members");
const accounts = clanCol("clan_accounts");
const chats = clanCol("clan_chats");
const stats = pluginCol("plugin_stats");
const deaths = pluginCol("plugin_deaths");
const slayer = pluginCol("plugin_slayer");
const loot = pluginCol("plugin_loot_drops");
const pets = pluginCol("plugin_pet_drops");
const quests = pluginCol("plugin_quests");
const diaries = pluginCol("plugin_diaries");
const clues = pluginCol("plugin_clues");
const colLog = pluginCol("plugin_collection_log");
const combatAch = pluginCol("plugin_combat_achievement_catalog");
const farming = pluginCol("plugin_farming");

const REGISTRY: Record<string, Record<string, Resolver>> = {
    "*": {
        rsn: members("member_name"),
        accountType: accounts("account_type"),
    },
    level_up: {
        skill: stats("skill"),
        level: stats("level"),
    },
    death: {
        causeName: deaths("cause_name"),
        regionName: deaths("region_name"),
        area: deaths("area"),
        causeCategory: deaths("cause_category"),
        causeKind: deaths("cause_kind"),
    },
    slayer: {
        targetName: slayer("target_name"),
        masterName: slayer("master_name"),
        bossName: slayer("boss_name"),
        areaName: slayer("area_name"),
    },
    loot: {
        source: loot("cause_name"),
        items: loot("item_name"),
        regionName: loot("region_name"),
        causeKind: loot("cause_kind"),
    },
    pet_drop: {
        petName: pets("pet_item_name"),
        trigger: pets("trigger"),
        source: pets("source_name"),
        regionName: pets("region_name"),
        sourceKind: pets("source_kind"),
    },
    quest_completed: {
        name: quests("quest_name"),
        status: quests("state"),
    },
    diary_completed: {
        region: diaries("diary_region"),
        name: diaries("diary_name"),
        tier: diaries("tier"),
    },
    clue_completed: {
        tier: clues("tier"),
    },
    collection_log_entry: {
        itemName: colLog("item_name"),
        category: colLog("category"),
    },
    combat_achievement_completed: {
        name: combatAch("task_name"),
        bossName: combatAch("boss_name"),
        taskType: combatAch("task_type"),
        tier: combatAch("tier"),
    },
    farming_patch: {
        patchRegionName: farming("patch_region_name"),
        cropName: farming("crop_name"),
        state: farming("state"),
    },
    clan_chat: {
        rank: members("rank"),
        message: chats("text"),
    },
};

export function conditionValueOptions(clanId: string, triggerType: string, field: string): readonly string[] {
    const resolver = REGISTRY[triggerType]?.[field] ?? REGISTRY["*"]?.[field];
    return resolver ? resolver(clanId) : [];
}
