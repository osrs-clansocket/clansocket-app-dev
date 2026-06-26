import type Database from "better-sqlite3";

export interface TableColSpec {
    table: string;
    column: string;
}

export interface PreparedTableDelete {
    table: string;
    stmt: Database.Statement;
}

export type DeleteBag = Record<string, number>;
