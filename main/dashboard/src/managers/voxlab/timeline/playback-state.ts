export interface PlaybackState {
    cursorMs: number;
    playStartMs: number;
    playStartCursor: number;
    rafHandle: number;
    playing: boolean;
}

export function newPlaybackState(): PlaybackState {
    return { cursorMs: 0, playStartMs: 0, playStartCursor: 0, rafHandle: 0, playing: false };
}
