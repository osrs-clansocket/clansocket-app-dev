import { isBoolean, isNumber, isString, type PayloadValidator } from "./type-guards.js";
import { hasDiscordCore } from "./discord-payload-checks.js";

export { hasDiscordCore, hasBeforeAfter, hasOverwriteTarget } from "./discord-payload-checks.js";

export const withString =
    (field: string): PayloadValidator =>
    (p) =>
        hasDiscordCore(p) && isString(p[field]);

export const withNumber =
    (field: string): PayloadValidator =>
    (p) =>
        hasDiscordCore(p) && isNumber(p[field]);

export const withBoolean =
    (field: string): PayloadValidator =>
    (p) =>
        hasDiscordCore(p) && isBoolean(p[field]);

export const withStringPair =
    (a: string, b: string): PayloadValidator =>
    (p) =>
        hasDiscordCore(p) && isString(p[a]) && isString(p[b]);

export const withNumberPair =
    (a: string, b: string): PayloadValidator =>
    (p) =>
        hasDiscordCore(p) && isNumber(p[a]) && isNumber(p[b]);
