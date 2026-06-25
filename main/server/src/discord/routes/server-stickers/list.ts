import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { stickersByGuild } from "../../../database/discord/state/server-stickers/list-server-stickers.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/server-stickers");

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "server stickers list",
                    responseKey: "stickers",
                    errorCode: "server_stickers_list_failed",
                    loader: stickersByGuild,
                });
            }),
        ),
    );
})();

export default router;
