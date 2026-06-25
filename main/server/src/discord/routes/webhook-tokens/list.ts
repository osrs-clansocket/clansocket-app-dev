import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { listWebhookTokens } from "../../../database/discord/webhook-tokens/list.js";
import { withServer } from "../route-common/preflight.js";
import { respondGuildList } from "../route-common/respond.js";
import { PATH_GUILD } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
const router = mountedRouter("/webhook-tokens");

(() => {
    router.get(
        PATH_GUILD,
        validateGuildId,
        handleAsync(
            withServer((ctx, _req, res) => {
                respondGuildList({
                    res,
                    ctx,
                    routeName: "webhook-tokens list",
                    responseKey: "tokens",
                    errorCode: "webhook_tokens_list_failed",
                    loader: listWebhookTokens,
                });
            }),
        ),
    );
})();

export default router;
