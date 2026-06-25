import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { emojisByGuild } from "../../../database/discord/state/server-emojis/list-server-emojis.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/server-emojis");

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "server emojis list",
                    responseKey: "emojis",
                    errorCode: "server_emojis_list_failed",
                    loader: emojisByGuild,
                });
            }),
        ),
    );
})();

export default router;
