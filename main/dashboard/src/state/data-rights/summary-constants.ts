export const HEURISTIC_FIELDS = [
    "title",
    "name",
    "kind",
    "rsn",
    "label",
    "status",
    "message",
    "body",
    "source",
    "action",
    "role",
] as const;

export const TRUNCATE_AT = 60;
export const MS_EPOCH_MIN = 1_000_000_000_000;
export const ISO_DATETIME_LEN = 19;
export const MAX_VALUE_LEN_FACTOR = 4;
