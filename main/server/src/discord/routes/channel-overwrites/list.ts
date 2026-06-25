import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { overwritesByGuild } from "../../../database/discord/state/channel-overwrites/list-overwrites.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/channel-overwrites");

(() => {
    router.get(
        "/:guildId",
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "channel-overwrites list",
                    responseKey: "overwrites",
                    errorCode: "channel_overwrites_list_failed",
                    loader: overwritesByGuild,
                });
            }),
        ),
    );
})();

export default router;
