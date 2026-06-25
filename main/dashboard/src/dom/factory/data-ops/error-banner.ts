import { build, type Instance } from "../core";
import { image } from "../content-ops/graphics/media.js";
import { heading, paragraph } from "../content-ops/text.js";
import { buildActionButton } from "./error-banner-actions.js";
import { buildMessage, buildStackWrapper } from "./error-banner-stack.js";
import {
    ERROR_BANNER_ACTION_DISMISS,
    ERROR_BANNER_ACTION_NONE,
    ERROR_BANNER_BODY_CLASS,
    ERROR_BANNER_CLASS,
    ERROR_BANNER_LOGO_CLASS,
    ERROR_BANNER_LOGO_SRC,
    ERROR_BANNER_PATH_CLASS,
    ERROR_BANNER_TITLE_CLASS,
    ERROR_BANNER_TOP_CLASS,
    type ErrorBannerAction,
} from "../../../shared/constants/error-banner-constants.js";

interface ErrorBannerProps {
    title: string;
    message: string;
    path?: string;
    stack?: string;
    action?: ErrorBannerAction;
    onDismiss?: () => void;
}

const TAG_DIV = "div";

function buildLogo(): Instance<HTMLImageElement> {
    return image({
        src: ERROR_BANNER_LOGO_SRC,
        alt: "",
        lazy: false,
        classes: [ERROR_BANNER_LOGO_CLASS],
        context: null,
        meta: null,
    });
}

function buildBody(props: ErrorBannerProps, messageRow: Instance<HTMLElement>): Instance<HTMLElement> {
    const titleInst = heading("h2", {
        classes: [ERROR_BANNER_TITLE_CLASS],
        context: null,
        meta: null,
        text: props.title,
    });
    const body = build({ tag: TAG_DIV, classes: [ERROR_BANNER_BODY_CLASS] });
    body.addChild(titleInst);
    if (props.path !== undefined && props.path !== "") {
        const pathInst = paragraph({
            classes: [ERROR_BANNER_PATH_CLASS],
            context: null,
            meta: null,
            text: props.path,
        });
        body.addChild(pathInst);
    }
    body.addChild(messageRow);
    return body;
}

export function errorBanner(props: ErrorBannerProps): Instance<HTMLElement> {
    const action = props.action ?? ERROR_BANNER_ACTION_DISMISS;
    const stack = props.stack ?? "";
    const hasStack = stack !== "";
    const banner = build({ tag: TAG_DIV, classes: [ERROR_BANNER_CLASS] });

    if (action !== ERROR_BANNER_ACTION_NONE) {
        banner.addChild(buildActionButton(action, banner.el, props.onDismiss));
    }

    const message = buildMessage(props.message, banner.el, hasStack);
    const body = buildBody(props, message);
    const logo = buildLogo();
    const top = build({ tag: TAG_DIV, classes: [ERROR_BANNER_TOP_CLASS] });
    top.addChild(logo);
    top.addChild(body);
    banner.addChild(top);

    if (hasStack) {
        banner.addChild(buildStackWrapper(stack, props.path ?? "", props.message));
    }

    return banner;
}

export type { ErrorBannerProps };
