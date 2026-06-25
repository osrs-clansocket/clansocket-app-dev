import { paragraph } from "../../../factory";
import { DR_EMPTY_CLASS } from "../../../../shared/constants/rights-constants.js";

export function emptyPara(text: string): ReturnType<typeof paragraph> {
    return paragraph({ text, classes: [DR_EMPTY_CLASS], context: null, meta: null });
}
