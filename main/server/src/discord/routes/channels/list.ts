import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { listChannelsGuild } from "../../../database/discord/state/channels/list-channels.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";
import { MOUNT_CHANNELS, PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter(MOUNT_CHANNELS);

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "channels list",
                    responseKey: "channels",
                    errorCode: "channels_list_failed",
                    loader: listChannelsGuild,
                });
            }),
        ),
    );
})();

export default router;
