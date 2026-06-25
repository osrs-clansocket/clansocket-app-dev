import logger from "@clansocket/logger";

type TriggerEmit<TPayload = unknown> = (payload: TPayload) => void;

const SUBSCRIBERS: Map<string, Set<TriggerEmit>> = new Map();

function safeEmit<TPayload>(emit: TriggerEmit<TPayload>, payload: TPayload): void {
    try {
        emit(payload);
    } catch (err: any) {
        logger.warn(`Trigger subscriber threw: ${err.message}`);
    }
}

function subscriberSet(triggerId: string): Set<TriggerEmit> {
    let set = SUBSCRIBERS.get(triggerId);
    if (!set) {
        set = new Set();
        SUBSCRIBERS.set(triggerId, set);
    }
    return set;
}

export function addSubscriber<TPayload>(triggerId: string, emit: TriggerEmit<TPayload>): () => void {
    subscriberSet(triggerId).add(emit as TriggerEmit);
    return () => {
        SUBSCRIBERS.get(triggerId)?.delete(emit as TriggerEmit);
    };
}

export function fire<TPayload>(triggerId: string, payload: TPayload): void {
    const subs = SUBSCRIBERS.get(triggerId) ?? new Set<TriggerEmit>();
    for (const emit of subs) safeEmit(emit, payload);
}
