import { div, heading, type Child, type Instance, baseProps } from "../../factory";
import {
    ACCOUNT_CLAN_PANEL_CLASS,
    ACCOUNT_PANEL_BODY_CLASS,
    ACCOUNT_PANEL_FOOTER_CLASS,
    ACCOUNT_PANEL_TITLE_CLASS,
} from "../../../shared/constants/account-constants.js";

export interface AccountPanelProps {
    title: string;
    body: readonly Child[];
    footer?: readonly Child[];
}

export function accountPanel(props: AccountPanelProps): Instance {
    const children: Instance[] = [
        heading("h3", { classes: [ACCOUNT_PANEL_TITLE_CLASS], text: props.title, context: null, meta: null }),
        div(baseProps([ACCOUNT_PANEL_BODY_CLASS]), [...props.body]),
    ];
    if (props.footer !== undefined && props.footer.length > 0) {
        children.push(div(baseProps([ACCOUNT_PANEL_FOOTER_CLASS]), [...props.footer]));
    }
    return div(baseProps([ACCOUNT_CLAN_PANEL_CLASS]), children);
}
