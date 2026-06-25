export type Values = Record<string, string | number | boolean>;
export type Scope = { kind: "global" } | { kind: "members"; set: ReadonlySet<string> };
export const GLOBAL_SCOPE: Scope = { kind: "global" };
export const GLOBAL_TITLE_TEXT = "Global";
