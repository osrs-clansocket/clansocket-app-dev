import { button, div, paragraph, rsnTag, span, type Instance, baseProps, textProps } from "../../../factory/index.js";
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
    const host = div(baseProps([ACCOUNT_LIST_CLASS]));
    refresh(host);
    return accountPanel({ title: "Unresolved clan RSNs", body: [host] });
}

function refresh(host: Instance): void {
    void (async () => {
        const matches = await legacyRsnClient.listMatches();
        if (matches.length === 0) {
            host.setChildren(paragraph(textProps([ACCOUNT_EMPTY_CLASS], "No RSNs to claim.")));
            return;
        }
        host.setChildren(...matches.map((m) => buildRow(m, host)));
    })();
}

function buildRow(match: LegacyRsnMatch, host: Instance): Instance {
    const claimBtn = button({
        
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
    return div(baseProps([ACCOUNT_DEVICE_ROW_CLASS]), [
        span(baseProps([ACCOUNT_ROW_PRIMARY_CLASS]), [rsnTag({ rsn: match.legacyRsn, context: null, meta: null })]),
        claimBtn,
    ]);
}
