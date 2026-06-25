import { isNonEmpty } from "../../../shared/validators/non-empty-validator.js";
import { isPlainObject } from "../../../shared/validators/type-guards.js";
import type { DiscordBotPayload } from "../types/payload-type.js";

export function validateDiscordBot(payload: unknown): payload is DiscordBotPayload {
    if (!isPlainObject(payload)) return false;
    if (!isNonEmpty(payload.bot_token)) return false;
    if (!isNonEmpty(payload.application_id)) return false;
    if (payload.public_key !== undefined && !isNonEmpty(payload.public_key)) return false;
    return true;
}
