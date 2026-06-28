export const passthrough = <T>(e: T): T => e;
export const passNew = <T>(_o: unknown, n: T): T => n;
export const passReaction = (reaction: any, user: any) => ({ reaction, user });
export const passVoiceState = (oldState: any, newState: any) => ({ oldState, newState });
