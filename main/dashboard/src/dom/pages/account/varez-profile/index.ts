import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    paragraph,
    section,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory";
import { profileStore, type ProfileContext } from "../../../../ai/profile-store";
import { FORM_CLASS, FORM_ROW_CLASS, HINT_CLASS, setEditing } from "./state.js";
import { renderIdentity } from "./identity/index.js";
import { renderFocus } from "./focus.js";
import { renderSession } from "./session/index.js";

function buildClearBtn(rerender: () => void): Instance {
    return button({
        variant: BTN_VARIANT_OUTLINE,

        text: "Clear profile",
        ariaLabel: "Clear Varez profile",
        context: "clear the entire Varez profile",
        meta: ["destructive"],
        onClick: () => {
            setEditing(null);
            profileStore.clear();
            rerender();
        },
    });
}

function renderVarezProfile(host: Instance): void {
    const profile: ProfileContext = profileStore.load();
    const rerender = (): void => renderVarezProfile(host);
    const helpEl = paragraph(
        textProps(
            [HINT_CLASS],
            "Varez's picture of you, built across conversations. Stored only in this browser — edit any field, clear any time.",
        ),
    );
    const sec = section(baseProps([FORM_CLASS]), [helpEl]);
    renderIdentity(sec, profile.identity, rerender);
    renderFocus(sec, profile.focus, rerender);
    renderSession(sec, profile.session, rerender);
    sec.addChild(div(baseProps([FORM_ROW_CLASS]), [buildClearBtn(rerender)]));
    host.setChildren(sec);
}

export { renderVarezProfile };
