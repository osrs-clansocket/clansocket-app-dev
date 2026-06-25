import { build, type Instance } from "../core";
import { icon } from "../content-ops/graphics/media.js";
import { paragraph, pre } from "../content-ops/text.js";
import { button, BTN_VARIANT_BARE } from "../content-ops/button.js";
import { CODEBLOCK_CLASS } from "../../../shared/constants/codeblock-constants.js";
import {
    ERROR_BANNER_ACTIVE_CLASS,
    ERROR_BANNER_COPIED_CLASS,
    ERROR_BANNER_COPIED_RESET_MS,
    ERROR_BANNER_COPY_CLASS,
    ERROR_BANNER_COPY_ICON,
    ERROR_BANNER_COPY_LABEL,
    ERROR_BANNER_EXPANDED_CLASS,
    ERROR_BANNER_ICONBTN_CLASS,
    ERROR_BANNER_INFO_CLASS,
    ERROR_BANNER_INFO_ICON,
    ERROR_BANNER_INFO_LABEL,
    ERROR_BANNER_MESSAGE_CLASS,
    ERROR_BANNER_STACK_CLASS,
    ERROR_BANNER_STACK_WRAPPER_CLASS,
} from "../../../shared/constants/error-banner-constants.js";

const TAG_DIV = "div";

function buildInfoToggle(bannerEl: HTMLElement): Instance<HTMLButtonElement> {
    const onInfoClick = (): void => {
        const expanded = bannerEl.classList.toggle(ERROR_BANNER_EXPANDED_CLASS);
        infoInst.el.classList.toggle(ERROR_BANNER_ACTIVE_CLASS, expanded);
    };
    const infoInst: Instance<HTMLButtonElement> = button(
        {
            classes: [ERROR_BANNER_ICONBTN_CLASS, ERROR_BANNER_INFO_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: ERROR_BANNER_INFO_LABEL,
            context: null,
            meta: null,
            onClick: onInfoClick,
        },
        [icon({ name: ERROR_BANNER_INFO_ICON, ariaHidden: true, context: null, meta: null })],
    );
    return infoInst;
}

export function buildMessage(message: string, bannerEl: HTMLElement, hasStack: boolean): Instance<HTMLElement> {
    const messageInst = paragraph({
        classes: [ERROR_BANNER_MESSAGE_CLASS],
        context: null,
        meta: null,
        text: message,
    });
    if (!hasStack) return messageInst;
    messageInst.addChild(buildInfoToggle(bannerEl));
    return messageInst;
}

function buildCopyButton(copyPayload: string): Instance<HTMLButtonElement> {
    const onCopyClick = (): void => {
        void navigator.clipboard.writeText(copyPayload).then(() => {
            copyInst.el.classList.add(ERROR_BANNER_COPIED_CLASS);
            window.setTimeout(
                () => copyInst.el.classList.remove(ERROR_BANNER_COPIED_CLASS),
                ERROR_BANNER_COPIED_RESET_MS,
            );
        });
    };
    const copyInst: Instance<HTMLButtonElement> = button(
        {
            classes: [ERROR_BANNER_ICONBTN_CLASS, ERROR_BANNER_COPY_CLASS],
            variant: BTN_VARIANT_BARE,
            ariaLabel: ERROR_BANNER_COPY_LABEL,
            context: null,
            meta: null,
            onClick: onCopyClick,
        },
        [icon({ name: ERROR_BANNER_COPY_ICON, ariaHidden: true, context: null, meta: null })],
    );
    return copyInst;
}

export function buildStackWrapper(stack: string, path: string, message: string): Instance<HTMLElement> {
    const copyPayload = `${path}\n\n${message}\n\n${stack}`.trim();
    const stackInst = pre({
        classes: [CODEBLOCK_CLASS, ERROR_BANNER_STACK_CLASS],
        context: null,
        meta: null,
        text: stack,
    });
    const wrapper = build({ tag: TAG_DIV, classes: [ERROR_BANNER_STACK_WRAPPER_CLASS] });
    wrapper.addChild(stackInst);
    wrapper.addChild(buildCopyButton(copyPayload));
    return wrapper;
}
