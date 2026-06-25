import type { PluginConfigField } from "./plugin-config-types.js";

export const PLUGIN_CONFIG_FIELDS_PROGRESS: readonly PluginConfigField[] = [
    {
        key: "streamQuests",
        label: "Quests",
        description: "Snapshots + completions.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "streamDiaries",
        label: "Diaries",
        description: "Diary tasks + completions.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "streamClues",
        label: "Clues",
        description: "Opens + per-tier completions.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "streamCollectionLog",
        label: "Collection log",
        description: "Per-item + full snapshot on log open.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "streamCombatAchievements",
        label: "Combat achievements",
        description: "Catalog, snapshot, completions.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "sendClanChat",
        label: "Clan chat",
        description: "Configured clan only. Server dedups.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "streamMenuActions",
        label: "Menu actions",
        description: "Right-click options on objects/NPCs.",
        kind: "boolean",
        defaultValue: true,
    },
    {
        key: "streamFarming",
        label: "Farming patches",
        description: "Patch state changes.",
        kind: "boolean",
        defaultValue: true,
    },
];
