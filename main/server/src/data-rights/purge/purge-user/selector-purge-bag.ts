import type { PurgeUserResult } from "./types.js";
import type { DeleteBag } from "./purge-stmt-types.js";

const BAG_BY_TARGET: Record<string, (r: PurgeUserResult) => DeleteBag> = {
    app: (r) => r.appTableDeletes,
    varez: (r) => r.varezTableDeletes,
    discord: (r) => r.discordTableDeletes,
};

export function bagFor(target: "app" | "varez" | "discord", result: PurgeUserResult): DeleteBag {
    return (BAG_BY_TARGET[target] ?? BAG_BY_TARGET.discord)(result);
}
