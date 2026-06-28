import { registerEntityAttribute } from "../../../flows/registries/entity-attribute-registry.js";

registerEntityAttribute({
    path: "entity.skills.skill",
    label: "Skill name",
    type: "osrs-skill",
    valueSourceRef: "osrs-skill",
    sqlTable: "plugin_stats",
    sqlColumn: "skill",
});

registerEntityAttribute({
    path: "entity.skills.level",
    label: "Skill level",
    type: "integer",
    sqlTable: "plugin_stats",
    sqlColumn: "level",
});

registerEntityAttribute({
    path: "entity.kc.boss",
    label: "Boss / NPC name",
    type: "osrs-boss",
    valueSourceRef: "osrs-boss",
    sqlTable: "plugin_npc_kc",
    sqlColumn: "source_name",
});

registerEntityAttribute({
    path: "entity.collection_log.category",
    label: "Collection log category",
    type: "string",
    sqlTable: "plugin_collection_log",
    sqlColumn: "category",
});

registerEntityAttribute({
    path: "entity.collection_log.item_name",
    label: "Collection log item",
    type: "string",
    sqlTable: "plugin_collection_log",
    sqlColumn: "item_name",
});

registerEntityAttribute({
    path: "entity.clue_completions.tier",
    label: "Clue tier",
    type: "string",
    sqlTable: "plugin_clues",
    sqlColumn: "tier",
});

registerEntityAttribute({
    path: "entity.diary_completions.region",
    label: "Diary region",
    type: "string",
    sqlTable: "plugin_diaries",
    sqlColumn: "diary_region",
});

registerEntityAttribute({
    path: "entity.diary_completions.name",
    label: "Diary name",
    type: "string",
    sqlTable: "plugin_diaries",
    sqlColumn: "diary_name",
});

registerEntityAttribute({
    path: "entity.diary_completions.tier",
    label: "Diary tier",
    type: "string",
    sqlTable: "plugin_diaries",
    sqlColumn: "tier",
});

registerEntityAttribute({
    path: "entity.combat_achievements.tier",
    label: "Combat achievement tier",
    type: "string",
    sqlTable: "plugin_combat_achievement_catalog",
    sqlColumn: "tier",
});

registerEntityAttribute({
    path: "entity.combat_achievements.task_name",
    label: "Combat achievement task",
    type: "string",
    sqlTable: "plugin_combat_achievement_catalog",
    sqlColumn: "task_name",
});

registerEntityAttribute({
    path: "entity.combat_achievements.boss_name",
    label: "Combat achievement boss",
    type: "osrs-boss",
    valueSourceRef: "osrs-boss",
    sqlTable: "plugin_combat_achievement_catalog",
    sqlColumn: "boss_name",
});

registerEntityAttribute({
    path: "entity.pets.name",
    label: "Pet item name",
    type: "string",
    sqlTable: "plugin_pet_drops",
    sqlColumn: "pet_item_name",
});

registerEntityAttribute({
    path: "entity.quests.name",
    label: "Quest name",
    type: "string",
    sqlTable: "plugin_quests",
    sqlColumn: "quest_name",
});

registerEntityAttribute({
    path: "entity.quests.status",
    label: "Quest status",
    type: "string",
    sqlTable: "plugin_quests",
    sqlColumn: "state",
});
