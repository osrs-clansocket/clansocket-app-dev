import type { ChatResponse } from "../../../../ai/client";
import type { SendElements } from "./types.js";

export function wrapSendEls(els: SendElements, setSuggestion: (v: string) => void): SendElements {
    const baseOnResponse = els.onResponse;
    return {
        ...els,
        onResponse: (res: ChatResponse): void => {
            if (typeof res.suggestedUserResponse === "string" && res.suggestedUserResponse.length > 0) {
                setSuggestion(res.suggestedUserResponse);
            }
            if (baseOnResponse) baseOnResponse(res);
        },
    };
}
