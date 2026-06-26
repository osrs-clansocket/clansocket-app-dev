import { distinctClanTable, distinctPluginTable, type Resolver } from "./distinct-resolvers.js";

export const pluginCol =
    (table: string) =>
    (col: string): Resolver =>
        distinctPluginTable(table, col);

export const clanCol =
    (table: string) =>
    (col: string): Resolver =>
        distinctClanTable(table, col);
