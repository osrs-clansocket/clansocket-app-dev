import type { ModeKey } from "../../ai/modes-store/index.js";

export type ConcernRow = string | readonly string[];

export interface ConcernDef {
    readonly id: string;
    readonly title: string;
    readonly icon: string;
    readonly rows: readonly ConcernRow[];
    readonly defaultOpen?: true;
    readonly requiresMode?: ModeKey;
}

export interface TabConcerns {
    readonly concerns: readonly ConcernDef[];
}
