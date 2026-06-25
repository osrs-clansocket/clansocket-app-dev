import { button, div, paragraph, rsnTag, span, type Instance } from "../../../factory/index.js";
import { legacyRsnClient, type LegacyRsnMatch } from "../../../../state/identity/legacy-rsn-client.js";
import {
    ACCOUNT_DEVICE_ROW_CLASS,
    ACCOUNT_EMPTY_CLASS,
    ACCOUNT_LIST_CLASS,
    ACCOUNT_ROW_PRIMARY_CLASS,
} from "../../../../shared/constants/account-constants.js";
import { accountPanel } from "../account-panel.js";
import { defineAccountPanel } from "../registry.js";

defineAccountPanel({ key: "legacy-rsn", order: 60, build: () => legacyRsnPanel() });

export function legacyRsnPanel(): Instance {
    const host = div({ classes: [ACCOUNT_LIST_CLASS], context: null, meta: null });
    refresh(host);
    return accountPanel({ title: "Unresolved clan RSNs", body: [host] });
}

function refresh(host: Instance): void {
    void (async () => {
        const matches = await legacyRsnClient.listMatches();
        if (matches.length === 0) {
            host.setChildren(
                paragraph({ classes: [ACCOUNT_EMPTY_CLASS], text: "No RSNs to claim.", context: null, meta: null }),
            );
            return;
        }
        host.setChildren(...matches.map((m) => buildRow(m, host)));
    })();
}

function buildRow(match: LegacyRsnMatch, host: Instance): Instance {
    const claimBtn = button({
        compact: true,
        text: "Claim",
        context: "claim this unresolved clan RSN as yours",
        meta: ["action", "rsn"],
        onClick: async () => {
            claimBtn.el.disabled = true;
            const result = await legacyRsnClient.claim(match.clanSlug, match.legacyRsn);
            if (!result.ok) {
                claimBtn.el.disabled = false;
                claimBtn.el.title = result.message ?? result.error;
                return;
            }
            refresh(host);
        },
    });
    return div({ classes: [ACCOUNT_DEVICE_ROW_CLASS], context: null, meta: null }, [
        span({ classes: [ACCOUNT_ROW_PRIMARY_CLASS], context: null, meta: null }, [
            rsnTag({ rsn: match.legacyRsn, context: null, meta: null }),
        ]),
        claimBtn,
    ]);
}
