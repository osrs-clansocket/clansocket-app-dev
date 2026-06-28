import { setMeta } from "./placement-helpers.js";

export function setFlowName(name: string): void {
    setMeta({ name });
}

export function setFlowEnabled(enabled: boolean): void {
    setMeta({ enabled });
}

export function setFlowLoop(loop: boolean): void {
    setMeta({ loop });
}

export function setScheduleMs(scheduleAtMs: number | null): void {
    setMeta({ scheduleAtMs });
}
