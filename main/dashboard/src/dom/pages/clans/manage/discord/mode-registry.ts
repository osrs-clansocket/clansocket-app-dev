import "./modes";
import type { Instance } from "../../../../factory";
import { buildPlaceholderMode } from "./modes/placeholder-mode.js";
import { discordModeDefs, type ModeContext } from "./registry";

export type { ModeContext };

function labelForKey(key: string): string {
    const def = discordModeDefs().find((d) => d.key === key);
    return def?.label ?? key;
}

export function modeContent(ctx: ModeContext, key: string): Instance {
    const def = discordModeDefs().find((d) => d.key === key);
    if (def !== undefined) return def.build(ctx);
    return buildPlaceholderMode(labelForKey(key));
}
