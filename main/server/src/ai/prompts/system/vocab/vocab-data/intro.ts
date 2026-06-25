export { queryObjectDoctrine } from "./intro-query-doctrine.js";
export { scopeRules } from "./intro-scope-rules.js";

export function header(): string {
    return '# data sources vocab\n\nevery query is a `{ db, sql, clan? }` object in the top-level `query` array. **always emit `read: ["db-schema"]` before authoring queries** — it returns the live list of accessible db kinds, accessible clans (where applicable), tables, and cols. nothing about the schema is pre-declared here.';
}
