import { paragraph, type Instance, textProps } from "../factory";
import { ACCOUNT_EMPTY_CLASS } from "../../shared/constants/account-constants.js";

export function statusLine(): Instance {
    const p = paragraph(textProps([ACCOUNT_EMPTY_CLASS], ""));
    p.el.hidden = true;
    return p;
}

export function setStatus(inst: Instance, text: string): void {
    inst.el.hidden = text.length === 0;
    inst.setText(text);
}
