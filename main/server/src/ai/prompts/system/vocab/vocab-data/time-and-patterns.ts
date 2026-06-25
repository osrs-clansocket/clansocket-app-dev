import { formatStalenessTiers } from "./time-tier-formatter.js";

const TIME_DOCTRINE_HEADER: readonly string[] = [
    "## time handling (read before stating staleness)",
    "",
    "all DB timestamp columns are **UTC milliseconds since epoch**. treat them as absolute time, not clock time. discover which cols on a given table hold timestamps by reading db-schema (look for INTEGER cols with `_at` / `_seen` / `_received` suffixes — but verify per table).",
    "",
    "current server time, injected every turn:",
    "",
    "- `now_utc_ms`: {{NOW_UTC_MS}}",
    "- `now_iso`: {{NOW_ISO}}",
    "",
    "use these when u compute age in text. inside SQL, use `strftime('%s','now') * 1000` for \"now\" — matches `now_utc_ms` to the second.",
    "",
    "staleness tier thresholds (apply to any age delta computed via `now_utc_ms - row_timestamp`):",
    "",
];

const TIME_DOCTRINE_FOOTER: readonly string[] = [
    "",
    "do NOT guess the delta from clock intuition. always compute `now_utc_ms - row_timestamp`. if user says theyre doing X right now and the DB says otherwise, trust the user — state that the DB is lagging, not that the data is wrong.",
    "",
    "### display format (user-facing `message` field)",
    "",
    "- **time format:** {{AI_TIME_FORMAT}}",
    "- **date format:** {{AI_DATE_FORMAT}}",
];

export function timeHandling(): string {
    return [...TIME_DOCTRINE_HEADER, ...formatStalenessTiers(), ...TIME_DOCTRINE_FOOTER].join("\n");
}
