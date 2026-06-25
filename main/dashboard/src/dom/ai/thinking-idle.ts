import { IDLE_PHRASES } from "./idle-phrases";
import { nextFloat, nextInt } from "../../shared/random/non-crypto-random.js";
import { fireQpSequence, QP_FIRE_DELAY, QP_ROLL, QP_SEQUENCE } from "./thinking-qp.js";
import { getThinkLabel } from "./thinking-host.js";

export function randomIdlePhrase(): string {
    if (nextFloat() < QP_ROLL) {
        setTimeout(() => fireQpSequence(getThinkLabel), QP_FIRE_DELAY);
        return QP_SEQUENCE[0]!;
    }
    return IDLE_PHRASES[nextInt(IDLE_PHRASES.length)]!;
}
